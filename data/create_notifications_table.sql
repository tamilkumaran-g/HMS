-- Create notifications table for inter-hospital bed allocation requests
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    condition VARCHAR(255),
    bed_type VARCHAR(50),
    urgency VARCHAR(20) DEFAULT 'normal',
    from_hospital_id VARCHAR(50) REFERENCES hospitals(id),
    from_hospital_name VARCHAR(255),
    to_hospital_id VARCHAR(50) NOT NULL REFERENCES hospitals(id),
    to_hospital_name VARCHAR(255),
    preferred_hospital_id VARCHAR(50) REFERENCES hospitals(id),
    bed_id VARCHAR(50) REFERENCES beds(id),
    allocation_score FLOAT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    updated_by VARCHAR(255)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_to_hospital ON notifications(to_hospital_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_hospital_status ON notifications(to_hospital_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
