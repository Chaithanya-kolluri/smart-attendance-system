-- ==============================================================================
-- Smart Attendance System - Supabase PostgreSQL Database Schema
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create 'students' Table
-- Stores student demographic records and 128-dimensional facial embedding vectors
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,                           -- Student ID (e.g., "STU001")
    name TEXT NOT NULL,                            -- Full Name
    face_encoding JSONB NOT NULL,                  -- 128-dimensional face embedding vector array [f1, f2, ..., f128]
    class_assigned TEXT NOT NULL,                  -- Assigned Class (e.g., "CS101", "ECE-B")
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL  -- Registration Timestamp
);

-- 2. Create 'attendance' Table
-- Stores attendance check-in logs and status updates
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),     -- Unique log record ID
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE, -- Link to Student
    class_name TEXT NOT NULL,                           -- Class Name for session
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,       -- Timestamp when marked
    status TEXT DEFAULT 'Present' NOT NULL              -- 'Present', 'Absent', 'Late', 'Excused'
);

-- 3. High-Performance Indices
-- Optimized for fast filtering by class, student search, and chronological date queries
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_name ON attendance(class_name);
CREATE INDEX IF NOT EXISTS idx_attendance_timestamp ON attendance(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_assigned);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- 5. Define Policies (Permissive for API / MVP usage, adaptable for Auth)
-- Allow read access to all clients
CREATE POLICY "Allow public read access on students"
    ON students FOR SELECT
    TO public
    USING (true);

-- Allow insert/update on students
CREATE POLICY "Allow full write access on students"
    ON students FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Allow read access to attendance logs
CREATE POLICY "Allow public read access on attendance"
    ON attendance FOR SELECT
    TO public
    USING (true);

-- Allow insert/update on attendance logs
CREATE POLICY "Allow full write access on attendance"
    ON attendance FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Optional: View for Daily Class Attendance Summary
CREATE OR REPLACE VIEW daily_class_attendance AS
SELECT 
    a.id,
    a.student_id,
    s.name AS student_name,
    a.class_name,
    a.timestamp,
    a.status,
    DATE(a.timestamp AT TIME ZONE 'UTC') AS date_marked
FROM attendance a
JOIN students s ON a.student_id = s.id;

