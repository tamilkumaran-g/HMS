# backend/ai_agent.py - Advanced Algorithmic Bed Allocation
import asyncio
import numpy as np
from typing import Dict, List, Tuple, Optional
import os
import sys
from enum import Enum

# FIX: Add parent directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import db  # ABSOLUTE import
from datetime import datetime

class UrgencyLevel(Enum):
    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4

class CoordinationAgent:
    """
    AI-driven bed allocation engine using multi-criteria decision making.
    
    Scoring Matrix (Total: 100 points):
    - Clinical Match (40 pts): Hospital specialization match
    - Proximity (30 pts): Distance from patient location (Haversine)
    - Capacity Load (20 pts): Hospital utilization rate
    - Cost/Insurance (10 pts): Average cost alignment
    """
    
    # Hospital specializations and metadata (augmenting database)
    HOSPITAL_SPECIALIZATIONS = {
        "City_Hospital": {
            "specializations": ["Cardiology", "Neurology", "General", "Emergency"],
            "location": {"lat": 13.0827, "lng": 80.2707},  # Chennai
            "avg_cost_per_day": 3500
        },
        "Regional_Medical": {
            "specializations": ["Trauma", "Surgery", "Emergency", "General"],
            "location": {"lat": 13.1939, "lng": 79.8711},  # Bangalore
            "avg_cost_per_day": 4200
        },
        "Metro_Health": {
            "specializations": ["Cardiology", "Surgery", "ICU", "General"],
            "location": {"lat": 12.9716, "lng": 77.5946},  # Bangalore
            "avg_cost_per_day": 4800
        }
    }
    
    def __init__(self, db_instance):
        self.db = db_instance
    
    def haversine_distance(self, loc1: Dict, loc2: Dict) -> float:
        """
        Calculate geographical distance between two coordinates using Haversine formula.
        Distance is in kilometers.
        """
        lat1, lon1 = float(loc1.get("lat", 0)), float(loc1.get("lng", 0))
        lat2, lon2 = float(loc2.get("lat", 0)), float(loc2.get("lng", 0))
        
        R = 6371  # Earth's radius in km
        dlat = np.radians(lat2 - lat1)
        dlon = np.radians(lon2 - lon1)
        
        a = np.sin(dlat/2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon/2)**2
        c = 2 * np.arcsin(np.sqrt(a))
        
        return R * c
    
    def get_hospital_specializations(self, hospital_id: str) -> List[str]:
        """Get hospital specializations from enhanced metadata."""
        return self.HOSPITAL_SPECIALIZATIONS.get(
            hospital_id, 
            {"specializations": ["General"]}
        )["specializations"]
    
    def get_hospital_location(self, hospital_id: str) -> Dict:
        """Get hospital location from enhanced metadata."""
        return self.HOSPITAL_SPECIALIZATIONS.get(
            hospital_id,
            {"location": {"lat": 0, "lng": 0}}
        )["location"]
    
    def score_clinical_match(self, patient_condition: str, hospital_id: str) -> Tuple[float, str]:
        """
        Clinical Match Score (40 points max)
        - Perfect match (hospital specializes in condition): 40 pts
        - General match (hospital offers general care): 20 pts
        - No match: 0 pts
        """
        specializations = self.get_hospital_specializations(hospital_id)
        
        if patient_condition in specializations:
            return 40.0, f"✓ Specializes in {patient_condition}"
        elif "General" in specializations:
            return 20.0, "◐ General care available"
        else:
            return 0.0, "✗ No specialization match"
    
    def score_proximity(self, patient_location: Dict, hospital_id: str) -> Tuple[float, str]:
        """
        Proximity Score (30 points max)
        Scoring: 30 points at 0km, decreasing to 0 at 50km+
        Formula: 30 * max(0, 1 - distance/50)
        """
        hospital_location = self.get_hospital_location(hospital_id)
        distance = self.haversine_distance(patient_location, hospital_location)
        
        # Score decreases linearly from 30 to 0 over 50km
        proximity_score = max(0, 30 * (1 - distance / 50))
        
        return proximity_score, f"{distance:.1f}km away"
    
    def score_capacity_load(self, beds: List[Dict], patient_bed_type: str, urgency: str) -> Tuple[float, str]:
        """
        Capacity Load Score (20 points max)
        Measures available bed capacity and adjusts based on urgency.
        - Available beds / Total beds * 20
        - Critical urgency: +5 bonus if capacity > 30%
        - High urgency: +3 bonus if capacity > 20%
        """
        matching_beds = [b for b in beds if b["bed_type"] == patient_bed_type]
        available = sum(1 for b in matching_beds if b["status"] == "available")
        total = len(matching_beds)
        
        if total == 0:
            return 0.0, "No matching bed type"
        
        occupancy_rate = (total - available) / total
        utilization_score = 20 * (available / total)
        
        # Urgency bonus
        urgency_bonus = 0
        if urgency == "critical" and occupancy_rate < 0.7:
            urgency_bonus = 5
        elif urgency == "high" and occupancy_rate < 0.8:
            urgency_bonus = 3
        
        total_score = min(25, utilization_score + urgency_bonus)  # Cap at 25 with bonus
        
        return total_score, f"{available}/{total} beds available ({100-int(occupancy_rate*100)}% free)"
    
    def score_cost_alignment(self, hospital_id: str) -> Tuple[float, str]:
        """
        Cost/Insurance Score (10 points)
        - Hospitals with avg_cost_per_day < 4000: 10 pts
        - Hospitals with avg_cost_per_day 4000-5000: 5 pts
        - Hospitals with avg_cost_per_day > 5000: 2 pts
        """
        metadata = self.HOSPITAL_SPECIALIZATIONS.get(hospital_id, {})
        cost = metadata.get("avg_cost_per_day", 4000)
        
        if cost < 4000:
            return 10.0, f"₹{cost:,}/day (Affordable)"
        elif cost <= 5000:
            return 5.0, f"₹{cost:,}/day (Moderate)"
        else:
            return 2.0, f"₹{cost:,}/day (Premium)"
    
    def calculate_total_score(self, 
                             clinical_score: float,
                             proximity_score: float,
                             capacity_score: float,
                             cost_score: float,
                             urgency: str) -> float:
        """
        Calculate weighted total score.
        Urgency can adjust weights dynamically.
        """
        # Dynamic weight adjustment based on urgency
        if urgency == "critical":
            # Clinical match most important
            weights = {"clinical": 0.45, "proximity": 0.25, "capacity": 0.20, "cost": 0.10}
        elif urgency == "high":
            weights = {"clinical": 0.40, "proximity": 0.30, "capacity": 0.20, "cost": 0.10}
        else:
            # Normal/Low: balanced approach
            weights = {"clinical": 0.40, "proximity": 0.30, "capacity": 0.20, "cost": 0.10}
        
        total = (clinical_score * weights["clinical"] +
                proximity_score * weights["proximity"] +
                capacity_score * weights["capacity"] +
                cost_score * weights["cost"])
        
        return total
    
    def select_best_bed(self, beds: List[Dict], patient_bed_type: str, urgency: str) -> Optional[Dict]:
        """
        Select the best available bed for the patient based on urgency and bed type.
        
        Priority Rules:
        - Critical: First available bed of matching type (speed priority)
        - High: Prefer beds with better location/condition
        - Normal/Low: Prefer ICU > General > Emergency
        """
        matching_beds = [b for b in beds if b["bed_type"] == patient_bed_type and b["status"] == "available"]
        
        if not matching_beds:
            return None
        
        if urgency == "critical":
            # Urgent case: return first available
            return matching_beds[0]
        
        # For non-critical: prefer beds by quality/location
        # Sort by ID (as proxy for bed quality) - just take first for now
        return matching_beds[0]
    
    def allocate_bed(self, 
                    hospital_id: str, 
                    bed: Dict, 
                    patient_name: str) -> bool:
        """
        Atomic bed reservation/allocation.
        Updates bed status and saves patient occupant info.
        
        Returns: True if successful, False if bed already taken
        """
        try:
            # Verify bed is still available (prevent double-booking)
            current_beds = self.db.get_beds(hospital_id)
            bed_in_db = next((b for b in current_beds if b["id"] == bed["id"]), None)
            
            if not bed_in_db or bed_in_db["status"] != "available":
                # Bed no longer available - another request took it
                return False
            
            # Atomically update bed
            self.db.update_bed(bed["id"], "occupied", patient_name)
            return True
        except Exception as e:
            print(f"Allocation error: {e}")
            return False
    
    def allocate_patient(self, patient_data: Dict) -> Dict:
        """
        Main allocation algorithm using multi-criteria decision making.
        
        Returns:
        {
            "success": bool,
            "best_hospital": {id, name, specializations},
            "selected_bed": {id, bed_type, hospital_id},
            "allocation_score": float,
            "reasoning": {clinical, proximity, capacity, cost, total},
            "alternatives": [{hospital, score, reasoning}]
        }
        """
        hospitals = self.db.get_hospitals()
        patient_name = patient_data.get("name", "Unknown")
        patient_condition = patient_data.get("condition", "General")
        patient_bed_type = patient_data.get("bed_type", "General")
        patient_location = patient_data.get("location", {"lat": 0, "lng": 0})
        urgency = patient_data.get("urgency", "normal")
        
        # Score all hospitals
        hospital_scores = []
        
        for hospital in hospitals:
            hospital_id = hospital["id"]
            beds = self.db.get_beds(hospital_id)
            
            # Calculate component scores
            clinical_score, clinical_reason = self.score_clinical_match(patient_condition, hospital_id)
            proximity_score, proximity_reason = self.score_proximity(patient_location, hospital_id)
            capacity_score, capacity_reason = self.score_capacity_load(beds, patient_bed_type, urgency)
            cost_score, cost_reason = self.score_cost_alignment(hospital_id)
            
            # Calculate total weighted score
            total_score = self.calculate_total_score(
                clinical_score, proximity_score, capacity_score, cost_score, urgency
            )
            
            # Check if beds are available
            available_beds = [b for b in beds if b["bed_type"] == patient_bed_type and b["status"] == "available"]
            has_capacity = len(available_beds) > 0
            
            hospital_scores.append({
                "hospital": dict(hospital),
                "hospital_id": hospital_id,
                "beds": beds,
                "available_beds": available_beds,
                "total_score": total_score,
                "has_capacity": has_capacity,
                "reasoning": {
                    "clinical": {"score": clinical_score, "reason": clinical_reason},
                    "proximity": {"score": proximity_score, "reason": proximity_reason},
                    "capacity": {"score": capacity_score, "reason": capacity_reason},
                    "cost": {"score": cost_score, "reason": cost_reason},
                    "total_score": total_score
                }
            })
        
        # Sort by score (highest first)
        hospital_scores.sort(key=lambda x: (x["has_capacity"], x["total_score"]), reverse=True)
        
        # Try to allocate at top-scoring hospital with available beds
        for hospital_option in hospital_scores:
            if hospital_option["has_capacity"]:
                # Select best bed
                best_bed = self.select_best_bed(
                    hospital_option["beds"],
                    patient_bed_type,
                    urgency
                )
                
                if best_bed:
                    # Attempt atomic allocation
                    success = self.allocate_bed(
                        hospital_option["hospital_id"],
                        best_bed,
                        patient_name
                    )
                    
                    if success:
                        return {
                            "success": True,
                            "best_hospital": hospital_option["hospital"],
                            "selected_bed": dict(best_bed),
                            "allocation_score": hospital_option["total_score"],
                            "reasoning": hospital_option["reasoning"],
                            "alternatives": [
                                {
                                    "hospital": h["hospital"],
                                    "score": h["total_score"],
                                    "has_capacity": h["has_capacity"]
                                }
                                for h in hospital_scores[1:4]  # Next 3 alternatives
                            ]
                        }
        
        # No beds available anywhere
        return {
            "success": False,
            "error": "No available beds matching criteria",
            "alternatives": [
                {
                    "hospital": h["hospital"],
                    "score": h["total_score"],
                    "has_capacity": h["has_capacity"]
                }
                for h in hospital_scores[:3]
            ]
        }
    
    async def negotiate(self, patient: Dict) -> Dict:
        """
        Legacy method for backward compatibility.
        Calls new allocate_patient method.
        """
        return self.allocate_patient(patient)
