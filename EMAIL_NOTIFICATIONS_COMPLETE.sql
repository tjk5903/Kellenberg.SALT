-- ============================================
-- S.A.L.T. Complete Email Notification System
-- ============================================
-- This SQL file sets up triggers and functions for:
-- 1. Student signup confirmation emails
-- 2. Moderator notification on student signup
-- 3. Moderator notification on student cancellation
-- 4. Moderator reminder 24 hours before event
--
-- PREREQUISITE: Run EMAIL_REMINDERS_SETUP.sql first
-- ============================================

-- ============================================
-- 1. ENABLE HTTP EXTENSION (for calling Edge Functions)
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- 2. CREATE NOTIFICATION QUEUE TABLE
-- ============================================
-- Queue table to store pending email notifications
CREATE TABLE IF NOT EXISTS email_notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_type TEXT NOT NULL, -- 'signup_student', 'signup_moderator', 'cancel_moderator', 'reminder_moderator'
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE,
  event_location TEXT,
  student_name TEXT,
  student_email TEXT,
  moderator_name TEXT,
  additional_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' -- 'pending', 'sent', 'failed'
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON email_notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_type ON email_notification_queue(notification_type);

-- ============================================
-- 3. FUNCTION: Get Event Details with Moderator
-- ============================================
CREATE OR REPLACE FUNCTION get_event_with_moderator(p_event_id UUID)
RETURNS TABLE (
  event_id UUID,
  event_title TEXT,
  event_description TEXT,
  event_location TEXT,
  event_start_date TIMESTAMP WITH TIME ZONE,
  event_end_date TIMESTAMP WITH TIME ZONE,
  event_hours DECIMAL,
  moderator_id UUID,
  moderator_email TEXT,
  moderator_first_name TEXT,
  moderator_last_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as event_id,
    e.title as event_title,
    e.description as event_description,
    e.location as event_location,
    e.start_date as event_start_date,
    e.end_date as event_end_date,
    e.hours as event_hours,
    m.id as moderator_id,
    m.email as moderator_email,
    m.first_name as moderator_first_name,
    m.last_name as moderator_last_name
  FROM events e
  JOIN moderators m ON e.created_by = m.id
  WHERE e.id = p_event_id;
END;
$$;

-- ============================================
-- 4. FUNCTION: Queue Signup Notification
-- ============================================
CREATE OR REPLACE FUNCTION queue_signup_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student RECORD;
  v_event RECORD;
BEGIN
  -- Get student details
  SELECT first_name, last_name, email INTO v_student
  FROM students WHERE id = NEW.student_id;
  
  -- Get event and moderator details
  SELECT * INTO v_event
  FROM get_event_with_moderator(NEW.event_id);
  
  IF v_event IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Queue email to STUDENT (signup confirmation)
  INSERT INTO email_notification_queue (
    notification_type,
    recipient_email,
    recipient_name,
    event_id,
    event_title,
    event_date,
    event_location,
    student_name,
    student_email,
    moderator_name,
    additional_data
  ) VALUES (
    'signup_student',
    v_student.email,
    v_student.first_name || ' ' || v_student.last_name,
    NEW.event_id,
    v_event.event_title,
    v_event.event_start_date,
    v_event.event_location,
    v_student.first_name || ' ' || v_student.last_name,
    v_student.email,
    v_event.moderator_first_name || ' ' || v_event.moderator_last_name,
    jsonb_build_object(
      'event_description', v_event.event_description,
      'event_end_date', v_event.event_end_date,
      'event_hours', v_event.event_hours,
      'signup_id', NEW.id
    )
  );
  
  -- Queue email to MODERATOR (new signup notification)
  INSERT INTO email_notification_queue (
    notification_type,
    recipient_email,
    recipient_name,
    event_id,
    event_title,
    event_date,
    event_location,
    student_name,
    student_email,
    moderator_name,
    additional_data
  ) VALUES (
    'signup_moderator',
    v_event.moderator_email,
    v_event.moderator_first_name || ' ' || v_event.moderator_last_name,
    NEW.event_id,
    v_event.event_title,
    v_event.event_start_date,
    v_event.event_location,
    v_student.first_name || ' ' || v_student.last_name,
    v_student.email,
    v_event.moderator_first_name || ' ' || v_event.moderator_last_name,
    jsonb_build_object(
      'signup_id', NEW.id,
      'signup_status', NEW.status
    )
  );
  
  RETURN NEW;
END;
$$;

-- ============================================
-- 5. FUNCTION: Queue Cancellation Notification
-- ============================================
CREATE OR REPLACE FUNCTION queue_cancellation_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student RECORD;
  v_event RECORD;
BEGIN
  -- Get student details
  SELECT first_name, last_name, email INTO v_student
  FROM students WHERE id = OLD.student_id;
  
  -- Get event and moderator details
  SELECT * INTO v_event
  FROM get_event_with_moderator(OLD.event_id);
  
  IF v_event IS NULL THEN
    RETURN OLD;
  END IF;
  
  -- Queue email to MODERATOR (cancellation notification)
  INSERT INTO email_notification_queue (
    notification_type,
    recipient_email,
    recipient_name,
    event_id,
    event_title,
    event_date,
    event_location,
    student_name,
    student_email,
    moderator_name,
    additional_data
  ) VALUES (
    'cancel_moderator',
    v_event.moderator_email,
    v_event.moderator_first_name || ' ' || v_event.moderator_last_name,
    OLD.event_id,
    v_event.event_title,
    v_event.event_start_date,
    v_event.event_location,
    v_student.first_name || ' ' || v_student.last_name,
    v_student.email,
    v_event.moderator_first_name || ' ' || v_event.moderator_last_name,
    jsonb_build_object(
      'cancelled_at', NOW(),
      'original_signup_status', OLD.status
    )
  );
  
  RETURN OLD;
END;
$$;

-- ============================================
-- 6. CREATE TRIGGERS
-- ============================================

-- Trigger for new signups
DROP TRIGGER IF EXISTS on_student_signup ON student_event;
CREATE TRIGGER on_student_signup
  AFTER INSERT ON student_event
  FOR EACH ROW
  EXECUTE FUNCTION queue_signup_notification();

-- Trigger for cancellations (deletions)
DROP TRIGGER IF EXISTS on_student_cancel ON student_event;
CREATE TRIGGER on_student_cancel
  BEFORE DELETE ON student_event
  FOR EACH ROW
  EXECUTE FUNCTION queue_cancellation_notification();

-- ============================================
-- 7. FUNCTION: Get Pending Notifications
-- ============================================
CREATE OR REPLACE FUNCTION get_pending_notifications(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  notification_type TEXT,
  recipient_email TEXT,
  recipient_name TEXT,
  event_id UUID,
  event_title TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  event_location TEXT,
  student_name TEXT,
  student_email TEXT,
  moderator_name TEXT,
  additional_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.notification_type,
    q.recipient_email,
    q.recipient_name,
    q.event_id,
    q.event_title,
    q.event_date,
    q.event_location,
    q.student_name,
    q.student_email,
    q.moderator_name,
    q.additional_data
  FROM email_notification_queue q
  WHERE q.status = 'pending'
  ORDER BY q.created_at ASC
  LIMIT p_limit;
END;
$$;

-- ============================================
-- 8. FUNCTION: Mark Notification as Sent
-- ============================================
CREATE OR REPLACE FUNCTION mark_notification_sent(p_notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE email_notification_queue
  SET status = 'sent', processed_at = NOW()
  WHERE id = p_notification_id;
END;
$$;

-- ============================================
-- 9. FUNCTION: Mark Notification as Failed
-- ============================================
CREATE OR REPLACE FUNCTION mark_notification_failed(p_notification_id UUID, p_error TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE email_notification_queue
  SET status = 'failed', 
      processed_at = NOW(),
      additional_data = additional_data || jsonb_build_object('error', p_error)
  WHERE id = p_notification_id;
END;
$$;

-- ============================================
-- 10. FUNCTION: Get Events for Moderator Reminders
-- ============================================
CREATE OR REPLACE FUNCTION get_moderator_event_reminders()
RETURNS TABLE (
  event_id UUID,
  event_title TEXT,
  event_description TEXT,
  event_location TEXT,
  event_start_date TIMESTAMP WITH TIME ZONE,
  event_end_date TIMESTAMP WITH TIME ZONE,
  event_hours DECIMAL,
  moderator_id UUID,
  moderator_email TEXT,
  moderator_first_name TEXT,
  moderator_last_name TEXT,
  approved_count BIGINT,
  pending_count BIGINT,
  student_list JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as event_id,
    e.title as event_title,
    e.description as event_description,
    e.location as event_location,
    e.start_date as event_start_date,
    e.end_date as event_end_date,
    e.hours as event_hours,
    m.id as moderator_id,
    m.email as moderator_email,
    m.first_name as moderator_first_name,
    m.last_name as moderator_last_name,
    COUNT(CASE WHEN se.status = 'Approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN se.status = 'Pending' THEN 1 END) as pending_count,
    COALESCE(
      jsonb_agg(
        CASE WHEN se.status = 'Approved' THEN
          jsonb_build_object(
            'name', s.first_name || ' ' || s.last_name,
            'email', s.email,
            'grade', s.grade
          )
        END
      ) FILTER (WHERE se.status = 'Approved'),
      '[]'::jsonb
    ) as student_list
  FROM events e
  JOIN moderators m ON e.created_by = m.id
  LEFT JOIN student_event se ON e.id = se.event_id
  LEFT JOIN students s ON se.student_id = s.id
  WHERE 
    -- Event starts in 23-25 hours (tomorrow)
    e.start_date BETWEEN (NOW() + INTERVAL '23 hours') AND (NOW() + INTERVAL '25 hours')
    -- No moderator reminder has been sent yet
    AND NOT EXISTS (
      SELECT 1 FROM email_notification_queue q
      WHERE q.event_id = e.id 
      AND q.notification_type = 'reminder_moderator'
      AND q.status = 'sent'
    )
  GROUP BY e.id, e.title, e.description, e.location, e.start_date, e.end_date, e.hours,
           m.id, m.email, m.first_name, m.last_name;
END;
$$;

-- ============================================
-- 11. GRANT PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION get_event_with_moderator(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_pending_notifications(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION mark_notification_sent(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION mark_notification_failed(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION get_moderator_event_reminders() TO authenticated, service_role;

-- RLS for notification queue (service role only)
ALTER TABLE email_notification_queue ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 12. CLEANUP OLD NOTIFICATIONS (Optional Cron)
-- ============================================
-- Run this periodically to clean up old sent/failed notifications
-- DELETE FROM email_notification_queue 
-- WHERE processed_at < NOW() - INTERVAL '30 days';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Check if triggers exist
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname IN ('on_student_signup', 'on_student_cancel');

-- Check notification queue
SELECT notification_type, status, COUNT(*) 
FROM email_notification_queue 
GROUP BY notification_type, status;

