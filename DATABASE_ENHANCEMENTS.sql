-- ============================================
-- S.A.L.T. Enhanced Features Database Schema
-- ============================================
-- This file contains all SQL changes for the enhanced S.A.L.T. features:
-- - Hours tracking (20-hour minimum requirement)
-- - Event attendance check-in system
-- - Student agreement tracking
-- - Enhanced event details (dress code, roles, check-in instructions, students needed)

-- ============================================
-- 1. UPDATE EVENTS TABLE
-- ============================================
-- Add fields for hours credit and event requirements
ALTER TABLE events 
  ADD COLUMN hours DECIMAL(4,2) NOT NULL DEFAULT 2.0,
  ADD COLUMN dress_code TEXT,
  ADD COLUMN roles TEXT,
  ADD COLUMN check_in_instructions TEXT,
  ADD COLUMN students_needed INTEGER;

COMMENT ON COLUMN events.hours IS 'Service hours credit for completing this event';
COMMENT ON COLUMN events.dress_code IS 'Required dress code for the event (e.g., Full uniform, Business casual)';
COMMENT ON COLUMN events.roles IS 'Description of roles and responsibilities for volunteers';
COMMENT ON COLUMN events.check_in_instructions IS 'Instructions for where and when to check in';
COMMENT ON COLUMN events.students_needed IS 'Target number of student volunteers needed';

-- ============================================
-- 2. UPDATE STUDENT_EVENT TABLE
-- ============================================
-- Add attendance tracking fields
ALTER TABLE student_event
  ADD COLUMN attended BOOLEAN DEFAULT NULL,
  ADD COLUMN checked_in_at TIMESTAMP WITH TIME ZONE;

-- Update status constraint to include 'No-Show'
ALTER TABLE student_event
  DROP CONSTRAINT IF EXISTS student_event_status_check;

ALTER TABLE student_event
  ADD CONSTRAINT student_event_status_check 
    CHECK (status IN ('Pending', 'Approved', 'Not Needed', 'No-Show'));

COMMENT ON COLUMN student_event.attended IS 'NULL = not yet determined, TRUE = attended, FALSE = did not attend';
COMMENT ON COLUMN student_event.checked_in_at IS 'Timestamp when student checked in at the event';

-- ============================================
-- 3. UPDATE STUDENTS TABLE
-- ============================================
-- Add hours tracking and agreement fields
ALTER TABLE students
  ADD COLUMN total_hours DECIMAL(5,2) DEFAULT 0.0,
  ADD COLUMN agreed_to_terms BOOLEAN DEFAULT FALSE,
  ADD COLUMN terms_agreed_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN students.total_hours IS 'Running total of service hours earned (goal: 20 hours per year)';
COMMENT ON COLUMN students.agreed_to_terms IS 'Whether student has accepted the S.A.L.T. Student Agreement';
COMMENT ON COLUMN students.terms_agreed_at IS 'Timestamp when student agreed to terms';

-- ============================================
-- 4. CREATE HOURS CALCULATION FUNCTION
-- ============================================
-- Automatically updates student hours when attendance is marked
CREATE OR REPLACE FUNCTION update_student_hours()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  event_hours DECIMAL(4,2);
BEGIN
  -- Get the hours for this event
  SELECT hours INTO event_hours FROM events WHERE id = NEW.event_id;
  
  -- Add hours when marked as attended
  IF NEW.attended = TRUE AND (OLD.attended IS NULL OR OLD.attended = FALSE) THEN
    UPDATE students 
    SET total_hours = total_hours + event_hours
    WHERE id = NEW.student_id;
    
    RAISE NOTICE 'Added % hours to student %', event_hours, NEW.student_id;
  
  -- Remove hours if changed from attended to not attended
  ELSIF NEW.attended = FALSE AND OLD.attended = TRUE THEN
    UPDATE students 
    SET total_hours = total_hours - event_hours
    WHERE id = NEW.student_id;
    
    RAISE NOTICE 'Removed % hours from student %', event_hours, NEW.student_id;
  
  -- Deduct half hours for no-shows (penalty)
  ELSIF NEW.status = 'No-Show' AND (OLD.status IS NULL OR OLD.status != 'No-Show') THEN
    UPDATE students 
    SET total_hours = total_hours - (event_hours / 2)
    WHERE id = NEW.student_id;
    
    RAISE NOTICE 'Deducted % hours (no-show penalty) from student %', (event_hours / 2), NEW.student_id;
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_student_hours() IS 'Trigger function to automatically update student total_hours based on attendance';

-- ============================================
-- 5. CREATE TRIGGER FOR HOURS UPDATE
-- ============================================
-- Trigger fires after attendance is updated
DROP TRIGGER IF EXISTS on_attendance_update ON student_event;

CREATE TRIGGER on_attendance_update
  AFTER UPDATE ON student_event
  FOR EACH ROW
  EXECUTE FUNCTION update_student_hours();

COMMENT ON TRIGGER on_attendance_update ON student_event IS 'Automatically updates student hours when attendance is marked';

-- ============================================
-- 6. UPDATE CREATE_STUDENT_PROFILE FUNCTION
-- ============================================
-- Ensure new fields are initialized when student signs up
CREATE OR REPLACE FUNCTION create_student_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'user_type' = 'student' THEN
    INSERT INTO students (
      id, 
      email, 
      first_name, 
      last_name, 
      grade, 
      registration_year, 
      homeroom,
      total_hours,
      agreed_to_terms
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      (NEW.raw_user_meta_data->>'grade')::INTEGER,
      (NEW.raw_user_meta_data->>'registration_year')::INTEGER,
      NEW.raw_user_meta_data->>'homeroom',
      0.0,
      FALSE
    );
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================
-- 7. VERIFICATION QUERIES
-- ============================================
-- Run these to verify the changes were applied correctly

-- Check events table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name IN ('hours', 'dress_code', 'roles', 'check_in_instructions', 'students_needed')
ORDER BY ordinal_position;

-- Check student_event table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'student_event' 
AND column_name IN ('attended', 'checked_in_at', 'status')
ORDER BY ordinal_position;

-- Check students table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name IN ('total_hours', 'agreed_to_terms', 'terms_agreed_at')
ORDER BY ordinal_position;

-- Check if trigger exists
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_attendance_update';

-- Check if function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'update_student_hours';

-- ============================================
-- 8. SAMPLE DATA FOR TESTING (OPTIONAL)
-- ============================================
-- Uncomment and modify to add test data

-- Update existing events with new fields
-- UPDATE events 
-- SET 
--   hours = 2.5,
--   dress_code = 'Full uniform',
--   roles = 'Help set up tables, greet guests, serve refreshments',
--   check_in_instructions = 'Check in at the main entrance with Mrs. Smith',
--   students_needed = 15
-- WHERE id = 'your-event-id';

-- Test marking a student as attended
-- UPDATE student_event
-- SET attended = TRUE
-- WHERE id = 'your-signup-id';
-- -- Check that student's total_hours increased

-- Test marking a student as no-show
-- UPDATE student_event
-- SET status = 'No-Show'
-- WHERE id = 'your-signup-id';
-- -- Check that student's total_hours decreased by half the event hours

-- ============================================
-- 9. ROLLBACK SCRIPT (USE WITH CAUTION)
-- ============================================
-- Uncomment ONLY if you need to undo these changes

-- DROP TRIGGER IF EXISTS on_attendance_update ON student_event;
-- DROP FUNCTION IF EXISTS update_student_hours();
-- 
-- ALTER TABLE events 
--   DROP COLUMN IF EXISTS hours,
--   DROP COLUMN IF EXISTS dress_code,
--   DROP COLUMN IF EXISTS roles,
--   DROP COLUMN IF EXISTS check_in_instructions,
--   DROP COLUMN IF EXISTS students_needed;
-- 
-- ALTER TABLE student_event
--   DROP COLUMN IF EXISTS attended,
--   DROP COLUMN IF EXISTS checked_in_at;
-- 
-- ALTER TABLE student_event
--   DROP CONSTRAINT IF EXISTS student_event_status_check;
-- 
-- ALTER TABLE student_event
--   ADD CONSTRAINT student_event_status_check 
--     CHECK (status IN ('Pending', 'Approved', 'Not Needed'));
-- 
-- ALTER TABLE students
--   DROP COLUMN IF EXISTS total_hours,
--   DROP COLUMN IF EXISTS agreed_to_terms,
--   DROP COLUMN IF EXISTS terms_agreed_at;

-- ============================================
-- NOTES
-- ============================================
-- 1. The hours calculation trigger automatically updates student total_hours
-- 2. No-shows deduct HALF of the event hours as a penalty
-- 3. Students need 20 hours total per year to meet the requirement
-- 4. The agreed_to_terms field ensures students accept policies before using the app
-- 5. Check-in tracking helps moderators manage event attendance in real-time
-- 6. All timestamps are stored with timezone information for accuracy

