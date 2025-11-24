# Supabase Setup Guide

This guide will help you set up the Supabase backend for the SALT application.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - Name: `Kellenberg SALT`
   - Database Password: (choose a strong password)
   - Region: Choose closest to your location
4. Wait for the project to be created

## Step 2: Get Your API Credentials

1. Go to Settings → API
2. Copy your:
   - Project URL (starts with `https://`)
   - `anon` `public` key
3. Add these to your `.env` file:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## Step 3: Create Database Tables

Go to the SQL Editor in your Supabase dashboard and run the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  grade INTEGER CHECK (grade >= 9 AND grade <= 12),
  registration_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Moderators table
CREATE TABLE moderators (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  capacity INTEGER,
  created_by UUID NOT NULL REFERENCES moderators(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Event signup table (join table)
CREATE TABLE student_event (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Not Needed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, event_id)
);

-- Audit log table (optional)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_student_event_student_id ON student_event(student_id);
CREATE INDEX idx_student_event_event_id ON student_event(event_id);
CREATE INDEX idx_student_event_status ON student_event(status);
```

## Step 4: Set Up Row Level Security (RLS)

Run this SQL to enable RLS and create policies:

```sql
-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_event ENABLE ROW LEVEL SECURITY;

-- Students policies
CREATE POLICY "Students can view their own record"
  ON students FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Students can update their own record"
  ON students FOR UPDATE
  USING (auth.uid() = id);

-- Moderators policies
CREATE POLICY "Moderators can view their own record"
  ON moderators FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Moderators can update their own record"
  ON moderators FOR UPDATE
  USING (auth.uid() = id);

-- Events policies
CREATE POLICY "Everyone can view events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Moderators can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM moderators
      WHERE moderators.id = auth.uid()
    )
  );

CREATE POLICY "Moderators can update their own events"
  ON events FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Moderators can delete their own events"
  ON events FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Student Event policies
CREATE POLICY "Students can view their own signups"
  ON student_event FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Moderators can view signups for their events"
  ON student_event FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = student_event.event_id
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Students can create their own signups"
  ON student_event FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (SELECT 1 FROM students WHERE students.id = auth.uid())
  );

CREATE POLICY "Students can delete their own signups"
  ON student_event FOR DELETE
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Moderators can update signups for their events"
  ON student_event FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = student_event.event_id
      AND events.created_by = auth.uid()
    )
  );
```

## Step 5: Create Database Functions (Optional but Recommended)

These functions will automatically create profiles when users sign up:

```sql
-- Function to create student profile on signup
CREATE OR REPLACE FUNCTION create_student_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'user_type' = 'student' THEN
    INSERT INTO students (id, first_name, last_name, email, grade, registration_year)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.email,
      (NEW.raw_user_meta_data->>'grade')::INTEGER,
      EXTRACT(YEAR FROM NOW())::INTEGER
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create moderator profile on signup
CREATE OR REPLACE FUNCTION create_moderator_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'user_type' = 'moderator' THEN
    INSERT INTO moderators (id, first_name, last_name, email)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.email
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call profile creation functions
CREATE TRIGGER on_auth_user_created_student
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_student_profile();

CREATE TRIGGER on_auth_user_created_moderator
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_moderator_profile();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for student_event updated_at
CREATE TRIGGER update_student_event_updated_at
  BEFORE UPDATE ON student_event
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Step 6: Configure Authentication Settings

1. Go to Authentication → Settings in your Supabase dashboard
2. **Email Auth**: Make sure it's enabled
3. **Email Confirmations** (for development):
   - Disable "Enable email confirmations" to skip email verification during testing
   - Re-enable for production
4. **Email Templates**: Customize if needed

## Step 7: Test Your Setup

1. Try signing up as a student with a `@kellenberg.org` email
2. Try signing up as a moderator with any email
3. Verify profiles are created in the database
4. Test creating events as a moderator
5. Test signing up for events as a student

## Step 8: Seed Sample Data (Optional)

To populate your database with sample data for testing:

```sql
-- Insert sample moderator (you'll need to sign up first to get the ID)
-- Replace 'your-moderator-id' with actual UUID from auth.users

-- Insert sample events
INSERT INTO events (title, description, location, date, capacity, created_by)
VALUES 
  (
    'Food Drive Collection',
    'Help collect and sort food donations for local families in need.',
    'School Cafeteria',
    '2024-12-15 14:00:00',
    30,
    'your-moderator-id'
  ),
  (
    'Park Cleanup',
    'Join us for a community park cleanup event. Bring gloves!',
    'Eisenhower Park',
    '2024-12-20 10:00:00',
    25,
    'your-moderator-id'
  );
```

## Security Checklist

- ✅ RLS is enabled on all tables
- ✅ Policies restrict access appropriately
- ✅ Students can only access their own data
- ✅ Moderators can only manage their own events
- ✅ API keys are stored in `.env` and not committed to git
- ✅ Email confirmation is enabled in production

## Troubleshooting

### "User has no profile" error
- Make sure the trigger functions are created and working
- Check that metadata is being passed correctly during signup
- Verify the user_type is either 'student' or 'moderator'

### Can't see events or signups
- Check RLS policies are correctly set up
- Verify user is authenticated
- Check browser console for Supabase errors

### Authentication errors
- Verify your `.env` file has correct Supabase credentials
- Check that Authentication is enabled in Supabase dashboard
- Ensure email provider is configured correctly

## Production Deployment

Before deploying to production:

1. Enable email confirmations
2. Set up custom email templates
3. Configure allowed redirect URLs
4. Set up database backups
5. Monitor database usage and performance
6. Review and audit RLS policies

## Support

For Supabase-specific issues, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)

