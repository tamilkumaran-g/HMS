-- Migration: Create admins table with role-based access control
-- Run this in Supabase SQL Editor AFTER running seed.sql

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  hospital_id TEXT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('full_access', 'view_only')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_hospital_id ON admins(hospital_id);

-- Insert admin users with bcrypt-hashed passwords
-- Password for admin_city: city123
-- Password for admin_regional: regional123
-- Password for admin_metro: metro123
-- Note: These are bcrypt hashes (cost factor 12) - generate using Python bcrypt library

-- Note: Hospital IDs must match exactly with the ids in the hospitals table
-- Run: SELECT id FROM hospitals; to verify the exact IDs
INSERT INTO admins (username, password_hash, hospital_id, role) VALUES
('admin_city', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYC8cJ9bG', 'City_Hospital', 'full_access'),
('admin_regional', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn98z8Y4RQCxBBaxk8f1g5yPkqZ.', 'Regional_Medical', 'full_access'),
('admin_metro', '$2b$12$wiVy/wy/sUvoc6OGyMHlvOZIEQrRR76.EqMyExAgGk6CJU0GuKrdm', 'Metro_Health', 'full_access');

-- Note: In production, you should generate these hashes securely
-- The hashes above correspond to:
-- admin_city: city123
-- admin_regional: regional123  
-- admin_metro: metro123

-- Enable row level security (optional but recommended)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON admins TO authenticated;

-- Optional: Add admin activity logging
COMMENT ON TABLE admins IS 'Hospital admin users with role-based access control';
COMMENT ON COLUMN admins.role IS 'Access level: full_access can book beds, view_only can only view data';
