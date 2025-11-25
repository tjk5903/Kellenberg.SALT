-- Create table to track sent email reminders
CREATE TABLE IF NOT EXISTS email_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_event_id UUID NOT NULL REFERENCES student_event(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_type TEXT NOT NULL DEFAULT 'event_reminder',
  UNIQUE(student_event_id, email_type)
);

-- Add RLS policies
ALTER TABLE email_reminders ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to view their own email reminders
CREATE POLICY "Users can view own email reminders"
ON email_reminders FOR SELECT
TO authenticated
USING (
  student_event_id IN (
    SELECT id FROM student_event WHERE student_id = auth.uid()
  )
);

-- Create index for performance
CREATE INDEX idx_email_reminders_student_event ON email_reminders(student_event_id);

-- Create a function to get events needing reminders
CREATE OR REPLACE FUNCTION get_events_needing_reminders()
RETURNS TABLE (
  signup_id UUID,
  event_id UUID,
  event_title TEXT,
  event_description TEXT,
  event_location TEXT,
  event_start_date TIMESTAMP WITH TIME ZONE,
  event_end_date TIMESTAMP WITH TIME ZONE,
  student_id UUID,
  student_email TEXT,
  student_first_name TEXT,
  student_last_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    se.id as signup_id,
    e.id as event_id,
    e.title as event_title,
    e.description as event_description,
    e.location as event_location,
    e.start_date as event_start_date,
    e.end_date as event_end_date,
    s.id as student_id,
    s.email as student_email,
    s.first_name as student_first_name,
    s.last_name as student_last_name
  FROM student_event se
  JOIN events e ON se.event_id = e.id
  JOIN students s ON se.student_id = s.id
  WHERE 
    -- Event is approved
    se.status = 'Approved'
    -- Event starts in 23-25 hours (to catch events happening tomorrow)
    AND e.start_date BETWEEN (NOW() + INTERVAL '23 hours') AND (NOW() + INTERVAL '25 hours')
    -- No reminder has been sent yet
    AND NOT EXISTS (
      SELECT 1 FROM email_reminders er 
      WHERE er.student_event_id = se.id 
      AND er.email_type = 'event_reminder'
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_events_needing_reminders() TO authenticated, service_role;

