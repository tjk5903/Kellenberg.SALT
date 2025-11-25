# Email Reminder Setup Instructions

## Option 1: Using Resend (Recommended - Easiest)

### 1. Sign up for Resend
1. Go to https://resend.com/signup
2. Sign up for a free account (100 emails/day free)
3. Verify your domain or use the test domain for development
4. Go to API Keys and create a new API key
5. Copy the API key (starts with `re_`)

### 2. Add Resend API Key to Supabase
1. Go to your Supabase Dashboard
2. Click on "Project Settings" (gear icon)
3. Click on "Edge Functions" in the sidebar
4. Click on "Manage secrets"
5. Add a new secret:
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key

### 3. Set up the Edge Function

Run these commands in your terminal (from your project root):

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (you'll need your project reference ID)
supabase link --project-ref maqxkbmjgcvpjknzgcfn

# Create the edge function
supabase functions new send-event-reminders
```

### 4. Update the Edge Function Code

Replace the contents of `supabase/functions/send-event-reminders/index.ts` with the code provided below.

### 5. Deploy the Edge Function

```bash
# Deploy the function
supabase functions deploy send-event-reminders --no-verify-jwt

# Test the function manually
supabase functions invoke send-event-reminders
```

### 6. Set up Daily Cron Job

Run this SQL in Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run daily at 8 AM
SELECT cron.schedule(
  'send-event-reminders',
  '0 8 * * *', -- Run at 8:00 AM every day
  $$
  SELECT
    net.http_post(
      url:='https://maqxkbmjgcvpjknzgcfn.supabase.co/functions/v1/send-event-reminders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

**Important**: Replace `YOUR_SERVICE_ROLE_KEY` with your actual service role key from:
- Supabase Dashboard → Project Settings → API → service_role key

---

## Option 2: Using SMTP (Gmail, Outlook, etc.)

If you prefer to use your school's email or Gmail:

### 1. Get SMTP Credentials
For Gmail:
- Enable 2-factor authentication
- Create an "App Password" (Google Account → Security → App passwords)

### 2. Add SMTP credentials to Supabase Secrets
- `SMTP_HOST`: smtp.gmail.com
- `SMTP_PORT`: 587
- `SMTP_USER`: your-email@gmail.com
- `SMTP_PASS`: your-app-password
- `SMTP_FROM`: Kellenberg S.A.L.T <your-email@gmail.com>

### 3. Use the alternative Edge Function code (SMTP version)

---

## Testing

To test the email function manually:

```bash
# Invoke the function to see what reminders would be sent
supabase functions invoke send-event-reminders --method POST
```

## Monitoring

Check function logs:
```bash
supabase functions logs send-event-reminders
```

Or in the Supabase Dashboard:
- Go to Edge Functions → send-event-reminders → Logs

