# HMS Main - Full Project Context for ChatGPT

## 1. Project Identity

- Project name: `HMS-main`
- Domain: Hospital bed management and inter-hospital coordination
- Core goal: Track bed availability and support AI-assisted patient bed allocation across multiple hospitals with role-based admin access.
- Current style: FastAPI backend + React (Vite) frontend + PostgreSQL schema/scripts.

This document is intentionally detailed so you can upload it to ChatGPT and ask architecture, debugging, feature, and refactoring questions with strong context.

## 2. Tech Stack and Runtime

### Backend

- Language: Python 3.11 (Docker base image)
- Framework: FastAPI
- Server: Uvicorn
- Auth: JWT (`python-jose`) + bcrypt password hashing
- DB client: `psycopg2-binary`
- Utility libs: `python-dotenv`, `numpy`

From `requirements.txt`:

- `fastapi==0.104.1`
- `uvicorn[standard]==0.24.0`
- `streamlit==1.29.0`
- `psycopg2-binary==2.9.9`
- `pandas==2.1.4`
- `plotly==5.17.0`
- `numpy==1.26.2`
- `python-dotenv==1.0.0`
- `requests==2.31.0`
- `bcrypt==4.1.2`
- `python-jose[cryptography]==3.3.0`
- `python-multipart==0.0.6`

### Frontend

- Language: JavaScript (React)
- Build tool: Vite
- Routing: `react-router-dom`
- UI: Tailwind CSS v4 + custom CSS
- Icons: `lucide-react`
- Lint: ESLint

From `frontend/package.json`:

- React 19
- Vite 7
- Tailwind 4 via `@tailwindcss/vite`

## 3. Repository Map

Top-level relevant files/folders:

- `backend/`
  - `main.py` (FastAPI app and endpoints)
  - `database.py` (DB access layer)
  - `auth.py` (JWT + auth helpers)
  - `ai_agent.py` (bed-allocation scoring engine)
- `frontend/`
  - `src/App.jsx` (main routed app)
  - `src/api/client.js` (all API requests)
  - `src/hooks/useHospitalData.js`
  - `src/components/*` (dashboard, booking, admission, notifications, doctors)
- `data/`
  - `seed.sql`
  - `create_admins_table.sql`
  - `create_doctors_table.sql`
  - `create_notifications_table.sql`
- Root scripts:
  - `seed_runner.py`
  - `run_migration_notifications.py`
  - `generate_synthetic_data.py`
  - `generate_password_hashes.py`
- Infra:
  - `Dockerfile`

## 4. Backend Architecture

## 4.1 FastAPI App Entry

File: `backend/main.py`

Main responsibilities:

- Instantiate FastAPI app (`Hospital Digital Twin API` title).
- Configure CORS for:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
- Define auth, data, admission, booking, and notification endpoints.
- Use dependency `get_current_admin` for protected endpoints.

### Health Endpoint

- `GET /health`
- Returns healthy/error status and number of hospitals fetched from DB.

### Authentication Endpoint

- `POST /api/login`
- Input model: username/password
- Process:
  - fetch admin from DB by username
  - verify bcrypt password
  - create JWT with claims
  - update `last_login`
- Response includes:
  - `access_token`
  - `token_type`
  - `hospital_id`
  - `hospital_name`
  - `role`
  - `username`

### Protected Data Endpoints

- `GET /api/hospitals`
  - returns all hospitals + `isOwn` marker
- `GET /api/beds`
  - returns all beds + `isOwnHospital` marker
- `GET /api/beds/{hospital_id}`
  - returns beds for one hospital
- `GET /api/doctors`
  - optional query filters:
    - `hospital_id`
    - `specialization`
    - `available_only`

### Admission Endpoint

- `POST /api/admit_patient`
- Handles two flows:
  - Cross-hospital request: create pending notification only
  - Same-hospital request: run `CoordinationAgent.allocate_patient()` and return scoring + selected bed
- Adds doctor recommendation via `db.get_best_doctor_for_condition(...)`

### Notifications Endpoints

- `GET /api/notifications`
  - pending notifications for current admin hospital
- `POST /api/notifications/{notification_id}/approve`
  - marks notification `approved`
- `POST /api/notifications/{notification_id}/reject`
  - marks notification `rejected`
  - releases bed if `bed_id` exists

### Manual Booking Endpoint

- `POST /api/book_bed`
- Constraints enforced:
  - admin can only book in own hospital
  - role must be `full_access`
- updates bed to `occupied` and sets occupant name

## 4.2 Authentication Layer

File: `backend/auth.py`

Key constants and behavior:

- `SECRET_KEY` from env `JWT_SECRET_KEY` (has insecure fallback string)
- `ALGORITHM = HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES = 60`

Important functions:

- `verify_password(plain, hash)`
- `get_password_hash(password)`
- `create_access_token(data, expires_delta)`
- `decode_access_token(token)`
- `get_current_admin(...)` FastAPI dependency
- `verify_hospital_access(...)`
- `verify_full_access(...)`
- `authenticate_admin(username, password, admin_data)`

JWT claims include:

- `sub` (username)
- `hospital_id`
- `role`
- `exp`, `iat`, `iss`

## 4.3 Database Access Layer

File: `backend/database.py`

Pattern:

- class `PostgresDatabase`
- context-managed connection per operation
- `RealDictCursor` outputs dict-like rows
- DNS resolution step attempts to resolve host and prefer IPv4

Connection config comes from:

- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

with:

- `sslmode=require`
- `connect_timeout=10`

Core methods:

- `get_hospitals()`
- `get_beds(hospital_id=None)`
- `update_bed(...)`
- `update_bed_status(...)`
- `get_available_beds(...)`
- `get_admin_by_username(...)`
- `update_admin_last_login(...)`
- `get_hospital_by_id(...)`
- `get_doctors(...)`
- `get_available_doctors(...)`
- `get_best_doctor_for_condition(...)`
- `add_notification(...)`
- `get_notifications_for_hospital(...)`
- `get_notification_by_id(...)`
- `update_notification_status(...)`

Global instance:

- `db = PostgresDatabase()`

## 4.4 AI Allocation Engine

File: `backend/ai_agent.py`

Class: `CoordinationAgent`

Goal:

- score each hospital and choose best available bed for the patient.

Scoring dimensions described in code:

- Clinical match (max 40)
- Proximity (max 30)
- Capacity/load (max 20 + urgency bonus)
- Cost alignment (max 10)

Implemented via functions:

- `haversine_distance(...)`
- `score_clinical_match(...)`
- `score_proximity(...)`
- `score_capacity_load(...)`
- `score_cost_alignment(...)`
- `calculate_total_score(...)`
- `select_best_bed(...)`
- `allocate_bed(...)`
- `allocate_patient(...)`

Important implementation detail:

- Metadata is hardcoded in `HOSPITAL_SPECIALIZATIONS` (specializations, location, costs), not read from DB.

## 5. Database and SQL Schema

## 5.1 `hospitals`

From `data/seed.sql`:

- `id TEXT PRIMARY KEY`
- `name TEXT NOT NULL`
- `location JSONB NOT NULL`
- `specializations TEXT[]`
- `avg_cost_per_day INTEGER NOT NULL`
- `last_update TIMESTAMPTZ DEFAULT NOW()`

## 5.2 `beds`

From `data/seed.sql`:

- `id TEXT PRIMARY KEY`
- `hospital_id TEXT REFERENCES hospitals(id)`
- `bed_type TEXT NOT NULL`
- `status TEXT NOT NULL` (`available`, `occupied`, `cleaning`)
- `occupant TEXT`
- `eta_clean NUMERIC DEFAULT 0`
- `updated_at TIMESTAMPTZ DEFAULT NOW()`

## 5.3 `admins`

From `data/create_admins_table.sql`:

- `id SERIAL PRIMARY KEY`
- `username TEXT UNIQUE NOT NULL`
- `password_hash TEXT NOT NULL`
- `hospital_id TEXT NOT NULL REFERENCES hospitals(id)`
- `role TEXT NOT NULL CHECK (role IN ('full_access', 'view_only'))`
- timestamps

Seeded users:

- `admin_city` / `city123`
- `admin_regional` / `regional123`
- `admin_metro` / `metro123`

(all currently inserted with bcrypt hashes)

## 5.4 `doctors`

From `data/create_doctors_table.sql`:

- `id SERIAL PRIMARY KEY`
- `name`
- `specialization`
- `hospital_id INTEGER NOT NULL REFERENCES hospitals(id)`
- `experience_years`
- `max_patients`
- `current_patients`
- `is_available`
- `phone`, `email`, timestamps

Important schema warning:

- `hospitals.id` is `TEXT`, but `doctors.hospital_id` is `INTEGER`. This is inconsistent and likely to fail in strict PostgreSQL constraints/migrations.

## 5.5 `notifications`

From `data/create_notifications_table.sql` and migration script:

- `id SERIAL PRIMARY KEY`
- patient fields (`patient_name`, `condition`, `bed_type`, `urgency`)
- routing fields (`from_hospital_id`, `to_hospital_id`, names)
- optional linkage (`preferred_hospital_id`, `bed_id`, `allocation_score`)
- status lifecycle (`pending`, `approved`, `rejected`)
- audit fields (`updated_at`, `updated_by`)

## 6. API Contract Summary

## 6.1 Auth

### `POST /api/login`

Request:

```json
{
  "username": "admin_city",
  "password": "city123"
}
```

Response (example):

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "hospital_id": "City_Hospital",
  "hospital_name": "City Hospital",
  "role": "full_access",
  "username": "admin_city"
}
```

## 6.2 Data

- `GET /api/hospitals`
- `GET /api/beds`
- `GET /api/beds/{hospital_id}`
- `GET /api/doctors?hospital_id=...&specialization=...&available_only=true`

## 6.3 Admissions and Booking

### `POST /api/admit_patient`

Used by `frontend/src/components/NewAdmission.jsx` with payload shape:

```json
{
  "name": "Patient Name",
  "condition": "Cardiology",
  "bed_type": "ICU",
  "hospital_id": "City_Hospital",
  "urgency": "normal",
  "location": {
    "lat": 13.08,
    "lng": 80.27
  }
}
```

### `POST /api/book_bed`

Payload shape used by UI:

```json
{
  "bedId": "ICU-9",
  "hospital": {
    "id": "City_Hospital",
    "name": "City Hospital"
  },
  "bedType": "ICU",
  "patientName": "John Doe",
  "patientCondition": "General"
}
```

## 6.4 Notifications

- `GET /api/notifications`
- `POST /api/notifications/{id}/approve`
- `POST /api/notifications/{id}/reject`

## 7. Frontend Architecture

## 7.1 App and Routes

Files:

- `frontend/src/main.jsx`
- `frontend/src/App.jsx`
- `frontend/src/components/PrivateRoute.jsx`

Routing behavior:

- Public route: `/login`
- Protected route root: `/*`
  - `/` dashboard
  - `/bed-booking`
  - `/admission`
  - `/doctors`

`PrivateRoute` checks `localStorage.access_token`; if absent, redirects to `/login`.

## 7.2 API Client and Data Hook

Files:

- `frontend/src/api/client.js`
- `frontend/src/hooks/useHospitalData.js`

Important behavior:

- backend URL = `VITE_BACKEND_URL` or `http://localhost:8000`
- auto-adds Bearer token from localStorage
- on 401/403: clears localStorage and redirects to `/login`
- central methods:
  - `getHospitals`
  - `getBeds`
  - `admitPatient`
  - `bookBed`
  - `getNotifications`
  - `approveNotification`
  - `rejectNotification`
  - `getDoctors`

`useHospitalData` fetches hospitals + beds in parallel and exposes `refreshData`.

## 7.3 Main Dashboard Components

### `Header.jsx`

- Branding and project description text
- visual gradients/decorative effects

### `Navbar.jsx`

- shows `hospital_name`, `username`, role badge from localStorage
- links to Dashboard, Bed Booking, New Admission, Doctors
- logout clears localStorage and redirects to login

### `MetricsRow.jsx` + `MetricCard.jsx`

- per-hospital card with available/total and occupancy percent

### `BedStatusChart.jsx`

- conic-gradient donut chart for total available/occupied/cleaning

### `BedTypeChart.jsx`

- bar-style chart for counts per bed type + per-hospital mini breakdown

### `BedBookingInterface.jsx` + `BedGrid.jsx`

- own hospital section with ward tabs (`ICU`, `General`, `Emergency`)
- click available bed and submit patient details for manual booking
- view-only role disables booking
- shows read-only stats for other hospitals

### `NewAdmission.jsx`

- comprehensive admission form:
  - patient details
  - urgency
  - preferred hospital and bed type
  - location lat/lng
- renders result details:
  - allocation summary
  - AI reasoning breakdown
  - recommended doctor card
  - approval-required status if cross-hospital

### `BedAllocationNotifications.jsx`

- floating notification panel for pending requests
- expand request to see condition/urgency/timestamp and doctor list
- approve/reject actions trigger API calls from parent

### `DoctorAvailability.jsx`

- doctor cards with filters/sorting:
  - specialization
  - available only
  - sort by score/experience/availability
- shows availability status and slot load bars

### Supporting components

- `ErrorBoundary.jsx`: catches render failures and displays fallback
- `AdmissionForm.jsx`: legacy compact admission form (currently not used in active dashboard route layout)
- `NegotiationLog.jsx`: expects `result.negotiation_log`, mostly legacy vs current response shape
- `OccupancyChart.jsx`: simple occupancy bars (not currently wired into route layout)

## 7.4 Visual Style

Files:

- `frontend/src/App.css`

Highlights:

- Tailwind import + custom font imports
- dark gradient background theme
- custom display font class `.font-display`
- background utility `.bg-app` with layered radial/linear gradients

## 8. Runtime Flows

## 8.1 Login Flow

1. User opens `/login`.
2. `LoginPage` posts to `http://localhost:8000/api/login` (hardcoded URL in this component).
3. On success stores token and profile fields in localStorage.
4. Redirect to `/`.

## 8.2 Dashboard Data Load

1. `useHospitalData` loads hospitals + beds.
2. Dashboard computes:
   - occupancy cards per hospital
   - global bed-status counts
   - bed-type breakdown arrays
3. Notifications loaded via `getNotifications()` in `App.jsx`.

## 8.3 Manual Bed Booking Flow

1. Select own hospital bed (only available beds selectable).
2. Fill patient name and condition.
3. Submit to `/api/book_bed`.
4. Backend verifies own hospital + `full_access` role.
5. Bed status updated to occupied.
6. Frontend refreshes hospitals/beds.

## 8.4 Admission Flow (AI/Cross-Hospital)

1. Submit from `NewAdmission`.
2. Backend checks preferred hospital and whether request is cross-hospital.
3. If cross-hospital:
   - create pending notification for destination hospital
   - return success with `requires_approval: true`
4. If not cross-hospital:
   - run AI scoring allocation
   - assign bed and return reasoning and alternatives.

## 8.5 Notification Approval/Rejection

1. Destination hospital admin sees pending notifications.
2. Approve or reject endpoint updates status.
3. Reject may release bed if `bed_id` is attached.

## 9. Environment Variables and Config

Expected env vars for backend:

- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `JWT_SECRET_KEY`

Frontend env var:

- `VITE_BACKEND_URL` (used in `frontend/src/api/client.js`)

CORS currently only allows local Vite dev URLs.

## 10. Setup and Run Guide

## 10.1 Backend

From repo root:

```powershell
python -m venv .venv
& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Start backend:

```powershell
python backend/main.py
```

Alternative:

```powershell
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

## 10.2 Database Initialization

Typical sequence:

```powershell
python seed_runner.py
python run_migration_notifications.py
python generate_synthetic_data.py
```

Also ensure SQL scripts are compatible with your DB and run in correct order if done manually.

## 10.3 Frontend

```powershell
cd frontend
npm install
npm run dev
```

Build/lint:

```powershell
npm run build
npm run lint
```

## 10.4 Docker

Current `Dockerfile` installs Python deps and starts:

- `uvicorn backend.main:app --port 8000`
- `streamlit run frontend/app.py --port 8501`

Important: `frontend/app.py` does not exist in this repo, so the streamlit command path is currently invalid for this codebase.

## 11. Known Inconsistencies and Risks (Important)

These are high-value context points to discuss with ChatGPT:

1. Schema type mismatch:
   - `hospitals.id` is `TEXT`
   - `doctors.hospital_id` is `INTEGER`
   - referenced in `data/create_doctors_table.sql`

2. Potential bug in `GET /api/beds/{hospital_id}`:
   - `int(hospital_id)` cast used in comparisons in `backend/main.py`
   - but seeded hospital IDs are text like `City_Hospital`

3. Logging key mismatch:
   - notifications logs use `current_admin.get('sub')` in `backend/main.py`
   - auth dependency returns `username` key, not `sub`

4. AI metadata hardcoded in `backend/ai_agent.py`:
   - DB data and hardcoded values can diverge

5. `LoginPage` uses hardcoded backend URL:
   - `fetch("http://localhost:8000/api/login")`
   - does not use `VITE_BACKEND_URL`

6. Docker command mismatch:
   - references streamlit file that is absent (`frontend/app.py`)

7. Notifications doctor specialization mapping in UI can miss cases:
   - exact lookup by lowercased condition string in `BedAllocationNotifications.jsx`
   - fallback `General Medicine` may not exist in DB seeded specializations

8. Legacy/unused component expectations:
   - `NegotiationLog.jsx` expects `negotiation_log` structure not present in current response path

9. Security hardening needed:
   - fallback JWT secret string exists
   - CORS only dev hosts
   - no rate limiting

10. Concurrency handling:
    - bed allocation is check-then-update pattern, not explicit DB row-lock transaction

## 12. Suggested Improvements Backlog

High impact, practical tasks:

1. Unify hospital ID types across all tables and code.
2. Remove `int(hospital_id)` assumptions and compare as strings consistently.
3. Move all hardcoded hospital metadata to DB.
4. Add transaction-safe bed reservation (`SELECT ... FOR UPDATE`) for race protection.
5. Make login request use shared API client + `VITE_BACKEND_URL`.
6. Replace polling notifications with websocket/SSE.
7. Add pagination/filtering to beds/doctors APIs for scale.
8. Add audit table for admissions/allocations and admin actions.
9. Harden auth lifecycle with refresh tokens and secret management.
10. Fix Docker startup to match actual React frontend deployment strategy.

## 13. File-by-File Quick Reference

- `backend/main.py`: API endpoints and flow orchestration
- `backend/auth.py`: JWT/bcrypt auth
- `backend/database.py`: SQL methods and DB connectivity
- `backend/ai_agent.py`: scoring and allocation logic
- `frontend/src/App.jsx`: authenticated dashboard routes and event handlers
- `frontend/src/api/client.js`: fetch wrapper and endpoint functions
- `frontend/src/hooks/useHospitalData.js`: primary data loading hook
- `frontend/src/components/BedBookingInterface.jsx`: manual booking UX
- `frontend/src/components/NewAdmission.jsx`: AI admission UX
- `frontend/src/components/BedAllocationNotifications.jsx`: pending cross-hospital request UX
- `frontend/src/components/DoctorAvailability.jsx`: doctor browsing and sorting UI
- `data/*.sql`: base schema and seed/migration scripts

## 14. Ready-to-Use ChatGPT Prompt Pack

Use these directly after uploading this file.

1. "Using this project context, explain the exact request-response flow for `POST /api/admit_patient` in both same-hospital and cross-hospital scenarios."
2. "Identify all schema/code mismatches and give a step-by-step migration plan with SQL and Python code changes."
3. "Refactor plan: remove hardcoded hospital metadata in `backend/ai_agent.py` and fetch from DB instead."
4. "Design a transaction-safe bed allocation implementation to prevent double booking under concurrency."
5. "Generate backend unit tests for auth, doctor filtering, and notification approval/rejection flows."
6. "Generate frontend integration tests for login, booking, and admission submission flows with mocked API responses."
7. "Create a production-ready Docker Compose with backend, frontend, and PostgreSQL services, including env setup."
8. "Propose a websocket architecture for real-time notifications replacing polling, with FastAPI and React implementation sketch."
9. "Find security gaps from this context and provide a prioritized remediation checklist."
10. "Give a phased roadmap (MVP stabilization -> scale -> enterprise hardening) using the current codebase as baseline."

## 15. Notes for Anyone Assisting You

When helping on this repo, treat this as the source-of-truth context snapshot. Validate details against current files if the code has changed since this document was generated.
