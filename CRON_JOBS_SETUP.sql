-- ============================================
-- CRON JOBS FOR EMAIL NOTIFICATIONS
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres user
GRANT USAGE ON SCHEMA cron TO postgres;

-- ============================================
-- 1. SIGNUP NOTIFICATIONS (every 2 minutes)
-- Sends confirmation emails to students and moderators when students sign up
-- ============================================
SELECT cron.schedule(
  'send-signup-notifications',
  '*/2 * * * *',  -- Every 2 minutes
  $$
  SELECT
    net.http_post(
      url := 'https://maqxkbmjgcvpjknzgcfn.supabase.co/functions/v1/send-signup-notification',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hcXhrYm1qZ2N2cGprbnpnY2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MzQyMzEsImV4cCI6MjA0ODMxMDIzMX0.b0MvLm27EEEFuTNfPW21VWBDKdj0h_W00x3P74lRp3g"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- ============================================
-- 2. CANCELLATION NOTIFICATIONS (every 2 minutes)
-- Sends notification emails to moderators when students cancel
-- ============================================
SELECT cron.schedule(
  'send-cancellation-notifications',
  '*/2 * * * *',  -- Every 2 minutes
  $$
  SELECT
    net.http_post(
      url := 'https://maqxkbmjgcvpjknzgcfn.supabase.co/functions/v1/send-cancellation-notification',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hcXhrYm1qZ2N2cGprbnpnY2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MzQyMzEsImV4cCI6MjA0ODMxMDIzMX0.b0MvLm27EEEFuTNfPW21VWBDKdj0h_W00x3P74lRp3g"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- ============================================
-- 3. EVENT REMINDERS (every hour)
-- Sends 24-hour reminder emails to students and moderators
-- ============================================
SELECT cron.schedule(
  'send-event-reminders',
  '0 * * * *',  -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
      url := 'https://maqxkbmjgcvpjknzgcfn.supabase.co/functions/v1/send-event-reminders',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hcXhrYm1qZ2N2cGprbnpnY2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MzQyMzEsImV4cCI6MjA0ODMxMDIzMX0.b0MvLm27EEEFuTNfPW21VWBDKdj0h_W00x3P74lRp3g"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- ============================================
-- VIEW SCHEDULED JOBS
-- Run this to verify jobs are scheduled
-- ============================================
-- SELECT * FROM cron.job;

-- ============================================
-- TO REMOVE A JOB (if needed)
-- ============================================
-- SELECT cron.unschedule('send-signup-notifications');
-- SELECT cron.unschedule('send-cancellation-notifications');
-- SELECT cron.unschedule('send-event-reminders');

