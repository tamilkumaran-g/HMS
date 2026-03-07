-- Run this in Supabase SQL Editor
CREATE TABLE hospitals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location JSONB NOT NULL,
  specializations TEXT[],
  avg_cost_per_day INTEGER NOT NULL,
  last_update TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE beds (
  id TEXT PRIMARY KEY,
  hospital_id TEXT REFERENCES hospitals(id),
  bed_type TEXT NOT NULL,
  status TEXT NOT NULL, -- available, occupied, cleaning
  occupant TEXT,
  eta_clean NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE beds, hospitals;

-- SEED DATA: 3 Hospitals + 90+ Beds
INSERT INTO hospitals (id, name, location, specializations, avg_cost_per_day) VALUES
('City_Hospital', 'City Hospital', '{"lat": 13.0827, "lng": 80.2707}', ARRAY['Cardiology','Neurology'], 5000),
('Regional_Medical', 'Regional Medical Center', '{"lat": 13.0569, "lng": 80.2425}', ARRAY['Orthopedics','General Surgery'], 3500),
('Metro_Health', 'Metro Health', '{"lat": 13.0475, "lng": 80.2830}', ARRAY['Pediatrics','Cardiology'], 4200);

-- City Hospital Beds
INSERT INTO beds (id, hospital_id, bed_type, status, occupant) VALUES
('ICU-0', 'City_Hospital', 'ICU', 'occupied', 'John Doe'),
('ICU-1', 'City_Hospital', 'ICU', 'occupied', 'Jane Smith'),
('ICU-9', 'City_Hospital', 'ICU', 'available', ''),
('GEN-0', 'City_Hospital', 'General', 'occupied', 'Patient A'),
('GEN-29', 'City_Hospital', 'General', 'available', ''),
('ER-0', 'City_Hospital', 'Emergency', 'occupied', 'Emergency Case'),
('ER-14', 'City_Hospital', 'Emergency', 'available', '');

-- Regional Medical Beds (similar pattern)
INSERT INTO beds (id, hospital_id, bed_type, status, occupant) VALUES
('R-ICU-0', 'Regional_Medical', 'ICU', 'occupied', 'Ortho Patient'),
('R-ICU-7', 'Regional_Medical', 'ICU', 'available', ''),
('R-GEN-19', 'Regional_Medical', 'General', 'available', '');

-- Metro Health Beds
INSERT INTO beds (id, hospital_id, bed_type, status, occupant) VALUES
('M-ICU-7', 'Metro_Health', 'ICU', 'available', ''),
('M-GEN-39', 'Metro_Health', 'General', 'available', '');
    