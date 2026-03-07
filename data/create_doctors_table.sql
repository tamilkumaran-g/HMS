-- Create doctors table for Hospital Digital Twin
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(id),
    experience_years INTEGER DEFAULT 0,
    max_patients INTEGER DEFAULT 10,
    current_patients INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_doctors_hospital ON doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_available ON doctors(is_available, current_patients, max_patients);

-- Insert sample doctors data
INSERT INTO doctors (name, specialization, hospital_id, experience_years, max_patients, current_patients, is_available, phone, email) VALUES
-- City Hospital (id=1) doctors
('Dr. Sarah Johnson', 'Cardiology', 1, 15, 20, 12, true, '555-0101', 'sarah.j@cityhospital.com'),
('Dr. Michael Chen', 'Neurology', 1, 12, 15, 8, true, '555-0102', 'michael.c@cityhospital.com'),
('Dr. Emily Williams', 'Pediatrics', 1, 8, 25, 20, true, '555-0103', 'emily.w@cityhospital.com'),
('Dr. James Anderson', 'Orthopedics', 1, 20, 18, 15, true, '555-0104', 'james.a@cityhospital.com'),
('Dr. Lisa Martinez', 'Emergency Medicine', 1, 10, 30, 28, true, '555-0105', 'lisa.m@cityhospital.com'),

-- Regional Medical Center (id=2) doctors
('Dr. Robert Thompson', 'Cardiology', 2, 18, 22, 10, true, '555-0201', 'robert.t@regional.com'),
('Dr. Patricia Garcia', 'Neurology', 2, 14, 16, 12, true, '555-0202', 'patricia.g@regional.com'),
('Dr. David Lee', 'Pediatrics', 2, 9, 20, 15, true, '555-0203', 'david.l@regional.com'),
('Dr. Jennifer White', 'Orthopedics', 2, 16, 15, 14, true, '555-0204', 'jennifer.w@regional.com'),
('Dr. William Brown', 'Emergency Medicine', 2, 11, 25, 18, true, '555-0205', 'william.b@regional.com'),

-- Metro Health (id=3) doctors
('Dr. Mary Taylor', 'Cardiology', 3, 13, 18, 15, true, '555-0301', 'mary.t@metrohealth.com'),
('Dr. Christopher Davis', 'Neurology', 3, 17, 14, 8, true, '555-0302', 'chris.d@metrohealth.com'),
('Dr. Nancy Wilson', 'Pediatrics', 3, 7, 22, 18, true, '555-0303', 'nancy.w@metrohealth.com'),
('Dr. Daniel Moore', 'Orthopedics', 3, 19, 16, 10, true, '555-0304', 'daniel.m@metrohealth.com'),
('Dr. Karen Jackson', 'Emergency Medicine', 3, 12, 28, 25, true, '555-0305', 'karen.j@metrohealth.com');

-- Verify the data
SELECT d.name, d.specialization, h.name as hospital_name, 
       d.experience_years, d.current_patients, d.max_patients, d.is_available
FROM doctors d
JOIN hospitals h ON d.hospital_id = h.id
ORDER BY h.name, d.specialization, d.name;
