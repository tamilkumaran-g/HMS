# backend/main.py - FIXED VERSION
import os
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Optional

# FIX: Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# ABSOLUTE IMPORTS - NO MORE . notation
from database import db
from ai_agent import CoordinationAgent
from auth import (
    create_access_token,
    authenticate_admin,
    get_current_admin,
    verify_hospital_access,
    verify_full_access,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

app = FastAPI(title="🏥 Hospital Digital Twin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Notifications are now persisted in database (see database.py)

async def add_notification(payload: Dict) -> Dict:
    """Add notification to database instead of in-memory store."""
    try:
        print(f"📝 Adding notification: {payload}")
        notification = db.add_notification(payload)
        if notification:
            print(f"✅ Notification created: ID={notification.get('id')}, to_hospital={notification.get('to_hospital_id')}, patient={notification.get('patient_name')}")
            return notification
        else:
            print(f"❌ db.add_notification() returned None")
            raise ValueError("Failed to create notification")
    except Exception as e:
        print(f"❌ Error creating notification: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise
    return None

# ==================== PYDANTIC MODELS ====================

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    hospital_id: str
    hospital_name: str
    role: str
    username: str

@app.get("/health")
async def health_check():
    try:
        hospitals = db.get_hospitals()
        return {
            "status": "healthy", 
            "hospitals": len(hospitals),
            "message": f"Found {len(hospitals)} hospitals"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ==================== AUTHENTICATION ENDPOINTS ====================

@app.post("/api/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """
    Authenticate admin user and return JWT access token.
    
    Required fields:
    - username: Admin username
    - password: Admin password
    
    Returns:
    - access_token: JWT token for authentication
    - token_type: "bearer"
    - hospital_id: ID of admin's hospital
    - hospital_name: Name of admin's hospital
    - role: Admin role (full_access or view_only)
    - username: Admin username
    """
    # Get admin from database
    admin = db.get_admin_by_username(credentials.username)
    
    # Authenticate
    if not authenticate_admin(credentials.username, credentials.password, admin):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get hospital information
    hospital = db.get_hospital_by_id(admin["hospital_id"])
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Hospital not found for admin"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": admin["username"],
            "hospital_id": admin["hospital_id"],
            "role": admin["role"]
        },
        expires_delta=access_token_expires
    )
    
    # Update last login
    db.update_admin_last_login(credentials.username)
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        hospital_id=admin["hospital_id"],
        hospital_name=hospital["name"],
        role=admin["role"],
        username=admin["username"]
    )

# ==================== PROTECTED ENDPOINTS ====================

@app.get("/api/hospitals")
async def get_hospitals(current_admin: Dict = Depends(get_current_admin)):
    """
    Get all hospitals. Admin can see all hospitals for vacancy info.
    - Can book beds only in their assigned hospital
    - Can view vacancy of all hospitals
    Requires authentication.
    """
    # Return all hospitals for viewing
    hospitals = db.get_hospitals()
    
    if not hospitals:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hospitals found"
        )
    
    # Add isOwn flag to identify user's hospital
    hospitals_with_flags = []
    for h in hospitals:
        h_dict = dict(h)
        h_dict["isOwn"] = h_dict["id"] == current_admin["hospital_id"]
        hospitals_with_flags.append(h_dict)
    
    return {
        "hospitals": hospitals_with_flags,
        "count": len(hospitals),
        "ownHospitalId": current_admin["hospital_id"]
    }

@app.get("/api/beds")
async def get_all_beds(current_admin: Dict = Depends(get_current_admin)):
    """
    Get beds for all hospitals.
    - Admin can book beds only in their assigned hospital
    - Admin can view vacancy of all hospitals
    Requires authentication.
    """
    # Get beds for all hospitals
    all_beds = db.get_beds()
    beds_with_flags = []
    
    for bed in all_beds:
        bed_dict = dict(bed)
        # Mark if bed belongs to user's hospital (bookable) or other hospital (read-only)
        bed_dict["isOwnHospital"] = bed_dict["hospital_id"] == current_admin["hospital_id"]
        beds_with_flags.append(bed_dict)
    
    return {
        "beds": beds_with_flags,
        "total": len(beds_with_flags),
        "ownHospitalId": current_admin["hospital_id"]
    }

@app.get("/api/beds/{hospital_id}")
async def get_hospital_beds(
    hospital_id: str,
    current_admin: Dict = Depends(get_current_admin)
):
    """
    Get beds for a specific hospital.
    - All admins can view beds for any hospital (for vacancy info)
    - Only the hospital's admin with full_access can book
    Requires authentication.
    """
    # All admins can view beds from any hospital
    beds = db.get_beds(hospital_id)
    
    # Flag if this is the user's own hospital
    beds_with_flags = []
    for bed in beds:
        bed_dict = dict(bed)
        bed_dict["isOwnHospital"] = int(hospital_id) == current_admin["hospital_id"]
        beds_with_flags.append(bed_dict)
    
    return {
        "beds": beds_with_flags,
        "hospital_id": hospital_id,
        "isOwnHospital": int(hospital_id) == current_admin["hospital_id"]
    }

@app.get("/api/doctors")
async def get_doctors(
    hospital_id: Optional[str] = None,
    specialization: Optional[str] = None,
    available_only: bool = False,
    current_admin: Dict = Depends(get_current_admin)
):
    """
    Get doctors list with optional filters.
    
    Query params:
    - hospital_id: Filter by hospital
    - specialization: Filter by specialization (e.g., Cardiology, Neurology)
    - available_only: Show only available doctors (default: False)
    
    Requires authentication.
    """
    try:
        if available_only:
            # Get available doctors with optional specialization filter
            doctors = db.get_available_doctors(specialization=specialization)
            # Filter by hospital_id if provided
            if hospital_id:
                doctors = [d for d in doctors if str(d.get('hospital_id')) == str(hospital_id)]
        else:
            doctors = db.get_doctors(hospital_id=hospital_id)
            # Filter by specialization if provided
            if specialization:
                doctors = [d for d in doctors if d.get('specialization') == specialization]
        
        return {
            "doctors": doctors,
            "count": len(doctors),
            "filters": {
                "hospital_id": hospital_id,
                "specialization": specialization,
                "available_only": available_only
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching doctors: {str(e)}"
        )

@app.post("/api/admit_patient")
async def admit_patient(
    patient_data: Dict,
    current_admin: Dict = Depends(get_current_admin)
):
    """
    AI-driven bed allocation for new patient admission using multi-criteria decision making.
    
    The algorithm scores hospitals based on:
    1. Clinical Match (40%): Hospital specialization match for patient condition
    2. Proximity (30%): Distance from patient location (Haversine calculation)
    3. Capacity Load (20%): Hospital bed utilization rate
    4. Cost Alignment (10%): Hospital cost vs patient affordability
    
    Rules:
    - If same hospital: auto-allocate using AI scores
    - If different hospital: attempt allocation, mark for approval if different hospital
    
    Requires authentication.
    """
    try:
        print(f"Admission request received for {patient_data.get('name')}")
        
        patient_name = patient_data.get("name", "Unknown Patient").strip()
        condition = patient_data.get("condition", "General")
        bed_type = patient_data.get("bed_type", "General")
        preferred_hospital_id = patient_data.get("hospital_id")
        urgency = patient_data.get("urgency", "normal")
        location = patient_data.get("location", {})
        
        if not patient_name or not preferred_hospital_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing patient name or hospital ID"
            )
        
        # Validate hospital exists
        target_hospital = db.get_hospital_by_id(preferred_hospital_id)
        if not target_hospital:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hospital not found"
            )
        
        # Check if requesting admission at another hospital
        is_cross_hospital_request = str(preferred_hospital_id) != str(current_admin["hospital_id"])

        if is_cross_hospital_request:
            requesting_hospital = db.get_hospital_by_id(str(current_admin["hospital_id"]))
            requesting_hospital_name = (
                requesting_hospital["name"] if requesting_hospital else str(current_admin["hospital_id"])
            )
            
            # Get doctor recommendation for cross-hospital request
            recommended_doctor = db.get_best_doctor_for_condition(
                str(preferred_hospital_id), 
                condition
            )

            await add_notification({
                "patient_name": patient_name,
                "condition": condition,
                "bed_type": bed_type,
                "urgency": urgency,
                "from_hospital_id": str(current_admin["hospital_id"]),
                "from_hospital_name": requesting_hospital_name,
                "to_hospital_id": str(preferred_hospital_id),
                "to_hospital_name": target_hospital["name"],
                "preferred_hospital_id": str(preferred_hospital_id),
                "bed_id": None,
                "allocation_score": None
            })

            return {
                "success": True,
                "message": f"Request sent to {target_hospital['name']} for approval",
                "allocation": {
                    "patient_name": patient_name,
                    "condition": condition,
                    "bed_id": None,
                    "hospital_id": preferred_hospital_id,
                    "hospital_name": target_hospital["name"],
                    "bed_type": bed_type,
                    "urgency": urgency,
                    "requires_approval": True,
                    "was_preferred_hospital": True,
                    "timestamp": datetime.now().isoformat(),
                    "allocation_score": None,
                    "recommended_doctor": {
                        "name": recommended_doctor["name"] if recommended_doctor else None,
                        "specialization": recommended_doctor["specialization"] if recommended_doctor else None,
                        "experience_years": recommended_doctor["experience_years"] if recommended_doctor else None,
                        "score": round(recommended_doctor["score"], 2) if recommended_doctor and recommended_doctor.get("score") else None,
                        "available_slots": (recommended_doctor["max_patients"] - recommended_doctor["current_patients"]) if recommended_doctor else 0,
                        "phone": recommended_doctor.get("phone") if recommended_doctor else None,
                    } if recommended_doctor else None,
                    "reasoning": None,
                    "alternatives": []
                }
            }

        # Initialize AI coordination agent for same-hospital requests
        agent = CoordinationAgent(db)

        # Run algorithmic bed allocation
        allocation_result = agent.allocate_patient({
            "name": patient_name,
            "condition": condition,
            "bed_type": bed_type,
            "location": location,
            "urgency": urgency
        })

        if not allocation_result.get("success"):
            # No beds available
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=allocation_result.get("error", "No beds available matching patient criteria")
            )

        # Check if allocation is in the preferred hospital or different hospital
        allocated_hospital_id = allocation_result["best_hospital"]["id"]
        is_preferred_hospital = str(allocated_hospital_id) == str(preferred_hospital_id)

        # Check if requesting from own hospital
        is_own_hospital = str(preferred_hospital_id) == str(current_admin["hospital_id"])

        # Determine if this requires inter-hospital approval
        requires_approval = str(allocated_hospital_id) != str(current_admin["hospital_id"])
        
        # Get best doctor recommendation for the condition at the allocated hospital
        recommended_doctor = db.get_best_doctor_for_condition(
            str(allocated_hospital_id), 
            condition
        )
        
        # Build response with detailed scoring information
        response = {
            "success": True,
            "message": f"Bed allocated intelligently via AI coordinator",
            "allocation": {
                "patient_name": patient_name,
                "condition": condition,
                "bed_id": allocation_result["selected_bed"]["id"],
                "hospital_id": allocated_hospital_id,
                "hospital_name": allocation_result["best_hospital"]["name"],
                "bed_type": bed_type,
                "urgency": urgency,
                "requires_approval": requires_approval,
                "was_preferred_hospital": is_preferred_hospital,
                "timestamp": datetime.now().isoformat(),
                "allocation_score": round(allocation_result["allocation_score"], 2),
                "recommended_doctor": {
                    "name": recommended_doctor["name"] if recommended_doctor else None,
                    "specialization": recommended_doctor["specialization"] if recommended_doctor else None,
                    "experience_years": recommended_doctor["experience_years"] if recommended_doctor else None,
                    "score": round(recommended_doctor["score"], 2) if recommended_doctor and recommended_doctor.get("score") else None,
                    "available_slots": (recommended_doctor["max_patients"] - recommended_doctor["current_patients"]) if recommended_doctor else 0,
                    "phone": recommended_doctor.get("phone") if recommended_doctor else None,
                } if recommended_doctor else None,
                "reasoning": {
                    "clinical": allocation_result["reasoning"]["clinical"],
                    "proximity": allocation_result["reasoning"]["proximity"],
                    "capacity": allocation_result["reasoning"]["capacity"],
                    "cost": allocation_result["reasoning"]["cost"],
                    "total_score": allocation_result["reasoning"]["total_score"]
                },
                "alternatives": allocation_result.get("alternatives", [])
            }
        }
        
        if not is_preferred_hospital:
            response["allocation"]["note"] = f"AI determined {allocation_result['best_hospital']['name']} is optimal. Preferred hospital was {target_hospital['name']}."
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Admission error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/api/notifications")
async def get_notifications(current_admin: Dict = Depends(get_current_admin)):
    """
    Get pending bed allocation notifications for the admin's hospital.
    Shows requests from other hospitals for inter-hospital bed allocation.
    """
    try:
        # Get notifications from database for this hospital
        notifications = db.get_notifications_for_hospital(str(current_admin["hospital_id"]))
        print(f"📢 GET /api/notifications for hospital {current_admin.get('hospital_id')} (admin: {current_admin.get('sub')})")
        print(f"   Found {len(notifications)} pending notifications for this hospital")
        for n in notifications:
            print(f"   - ID={n['id']}, from={n.get('from_hospital_id')}, patient={n.get('patient_name')}")
        
        return {
            "notifications": notifications,
            "count": len(notifications)
        }
    except Exception as e:
        print(f"❌ Error fetching notifications: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notifications: {str(e)}"
        )

@app.post("/api/notifications/{notification_id}/approve")
async def approve_notification(
    notification_id: int,
    current_admin: Dict = Depends(get_current_admin)
):
    """
    Approve a pending bed allocation request.
    """
    try:
        print(f"📙 APPROVE request: notification_id={notification_id}, admin={current_admin.get('sub')}, hospital={current_admin.get('hospital_id')}")
        
        # Get notification from database
        notification = db.get_notification_by_id(notification_id)
        
        if not notification:
            print(f"❌ Notification {notification_id} not found in database")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification {notification_id} not found"
            )

        print(f"📋 Found notification: {dict(notification)}")
        
        # Check authorization
        notif_hospital_id = str(notification.get("to_hospital_id"))
        admin_hospital_id = str(current_admin["hospital_id"])
        
        if notif_hospital_id != admin_hospital_id:
            print(f"❌ Not authorized: notification hospital {notif_hospital_id} != admin hospital {admin_hospital_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not authorized to approve this request (notification hospital {notif_hospital_id} != your hospital {admin_hospital_id})"
            )

        # Update status in database
        updated = db.update_notification_status(notification_id, "approved", current_admin.get("sub", "unknown"))
        
        print(f"✅ Notification {notification_id} approved by {current_admin.get('sub')}")

        return {
            "success": True,
            "message": "Notification approved successfully",
            "notification": dict(updated) if updated else {}
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Approval error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve notification: {str(e)}"
        )

@app.post("/api/notifications/{notification_id}/reject")
async def reject_notification(
    notification_id: int,
    current_admin: Dict = Depends(get_current_admin)
):
    """
    Reject a pending bed allocation request and release the bed.
    """
    try:
        print(f"🗑️ REJECT request: notification_id={notification_id}, admin={current_admin.get('sub')}, hospital={current_admin.get('hospital_id')}")
        
        # Get notification from database
        notification = db.get_notification_by_id(notification_id)
        
        if not notification:
            print(f"❌ Notification {notification_id} not found in database")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification {notification_id} not found"
            )

        print(f"📋 Found notification: {dict(notification)}")

        # Check authorization
        notif_hospital_id = str(notification.get("to_hospital_id"))
        admin_hospital_id = str(current_admin["hospital_id"])
        
        if notif_hospital_id != admin_hospital_id:
            print(f"❌ Not authorized: notification hospital {notif_hospital_id} != admin hospital {admin_hospital_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not authorized to reject this request (notification hospital {notif_hospital_id} != your hospital {admin_hospital_id})"
            )

        # Update status in database
        updated = db.update_notification_status(notification_id, "rejected", current_admin.get("sub", "unknown"))

        # Release bed if it was reserved
        bed_id = notification.get("bed_id")
        if bed_id:
            db.update_bed(bed_id, "available", "")
            print(f"🛏️ Released bed {bed_id}")
        
        print(f"✅ Notification {notification_id} rejected by {current_admin.get('sub')}")

        return {
            "success": True,
            "message": "Notification rejected successfully",
            "notification": dict(updated) if updated else {}
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Rejection error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reject notification: {str(e)}"
        )

@app.post("/api/book_bed")
async def book_bed(
    booking_data: Dict,
    current_admin: Dict = Depends(get_current_admin)
):
    """
    Book a bed. 
    Requirements:
    - User must have full_access role
    - Bed must be in user's assigned hospital
    Booking beds in other hospitals is NOT allowed.
    Requires authentication.
    """
    try:
        print(f"Booking request received: {booking_data}")
        bed_id = booking_data.get("bedId")
        hospital_id = booking_data.get("hospital", {}).get("id")
        bed_type = booking_data.get("bedType")
        patient_name = booking_data.get("patientName", "Unknown Patient").strip()
        patient_condition = booking_data.get("patientCondition", "General")
        
        if not all([bed_id, hospital_id, bed_type]):
            print("Missing booking details")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing booking details"
            )
        
        # Check if user is trying to book a bed in another hospital
        # Convert to same type for comparison (hospital_id can be string or int)
        if str(hospital_id) != str(current_admin["hospital_id"]):
            print(f"Unauthorized: Admin trying to book bed in hospital {hospital_id}, but assigned to {current_admin['hospital_id']}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only book beds in your assigned hospital"
            )
        
        # Verify admin has full_access role
        verify_full_access(current_admin)
        
        # Update bed status in database with patient name
        print(f"Updating bed {bed_id} to occupied for patient {patient_name}")
        db.update_bed(bed_id, "occupied", patient_name)
        print(f"Bed {bed_id} updated successfully for patient {patient_name}")
        
        return {
            "success": True,
            "message": f"Bed {bed_id} successfully booked for {patient_name}",
            "bed_id": bed_id,
            "hospital_id": hospital_id,
            "bed_type": bed_type,
            "patient_name": patient_name,
            "patient_condition": patient_condition,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Booking error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.on_event("startup")
async def startup():
    print("🚀 Starting Hospital Digital Twin API...")
    try:
        hospitals = db.get_hospitals()
        print(f"✅ Found {len(hospitals)} hospitals: {[h['name'] for h in hospitals]}")
    except Exception as e:
        print(f"❌ Startup error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
