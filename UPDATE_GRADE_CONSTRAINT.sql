-- ============================================
-- Update Grade Constraint to Allow 6-12
-- ============================================
-- S.A.L.T. membership is open to students in grades 6-12
-- This updates the database constraint to match

-- Drop the old constraint
ALTER TABLE students
  DROP CONSTRAINT IF EXISTS students_grade_check;

-- Add the new constraint for grades 6-12
ALTER TABLE students
  ADD CONSTRAINT students_grade_check 
    CHECK (grade >= 6 AND grade <= 12);

-- Verify the change
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'students'::regclass 
AND conname = 'students_grade_check';

-- Test query to ensure grades 6-12 are valid
-- SELECT grade FROM students WHERE grade BETWEEN 6 AND 12;

