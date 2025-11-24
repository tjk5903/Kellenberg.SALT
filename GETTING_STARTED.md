# 🎯 Getting Started with SALT

Welcome! This guide will help you get the SALT application running from scratch.

## 📚 Documentation Overview

We have several guides to help you:

1. **GETTING_STARTED.md** (this file) - Start here!
2. **QUICKSTART.md** - Fastest way to get running
3. **SUPABASE_SETUP.md** - Detailed database configuration
4. **README.md** - Full project documentation
5. **DEPLOYMENT.md** - Deploy to production
6. **PROJECT_SUMMARY.md** - Technical overview

## 🎓 What You'll Build

By the end of this guide, you'll have a fully functional web app where:

- **Students** can browse and sign up for service events
- **Moderators** can create events and manage student signups
- Everything is secure with Row Level Security
- Modern, beautiful UI with Tailwind CSS

## ⏱️ Time Required

- **Quick setup** (if you have Supabase): 10-15 minutes
- **Complete setup** (from scratch): 30-45 minutes

## 🚀 Step-by-Step Setup

### Step 1: Check Prerequisites

Make sure you have these installed:

```bash
# Check Node.js (should be 18 or higher)
node --version

# Check npm
npm --version
```

Don't have Node.js? [Download it here](https://nodejs.org/)

### Step 2: Install Dependencies

Open a terminal in the project folder and run:

```bash
npm install
```

This will install:
- React 18
- Supabase client
- Tailwind CSS
- React Router
- All other dependencies

☕ This takes 2-3 minutes depending on your internet speed.

### Step 3: Set Up Supabase

#### 3a. Create Your Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email

#### 3b. Create Your Project

1. Click "New Project"
2. Choose an organization (or create one)
3. Fill in:
   - **Name**: `Kellenberg SALT`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. ☕ Wait 2-3 minutes for setup

#### 3c. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** (gear icon)
2. Click **API** in the sidebar
3. You'll see:
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon public key**: Copy this (long string starting with `eyJ...`)

#### 3d. Configure Your App

Create a file called `.env` in your project root:

```env
VITE_SUPABASE_URL=paste_your_project_url_here
VITE_SUPABASE_ANON_KEY=paste_your_anon_key_here
```

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important**: Never share these keys or commit the `.env` file to Git!

### Step 4: Set Up Your Database

#### 4a. Open SQL Editor

1. In Supabase dashboard, click **SQL Editor**
2. Click **New query**

#### 4b. Run Setup Scripts

Copy and paste **all three scripts** below, one at a time:

**Script 1: Create Tables**

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
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  capacity INTEGER,
  created_by UUID NOT NULL REFERENCES moderators(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Event signup table
CREATE TABLE student_event (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Not Needed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, event_id)
);

-- Indexes for performance
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_student_event_student_id ON student_event(student_id);
CREATE INDEX idx_student_event_event_id ON student_event(event_id);
```

Click **RUN** (or press F5)

**Script 2: Set Up Security**

```sql
-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_event ENABLE ROW LEVEL SECURITY;

-- Students policies
CREATE POLICY "Students can view their own record" ON students FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Students can update their own record" ON students FOR UPDATE USING (auth.uid() = id);

-- Moderators policies
CREATE POLICY "Moderators can view their own record" ON moderators FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Moderators can update their own record" ON moderators FOR UPDATE USING (auth.uid() = id);

-- Events policies
CREATE POLICY "Everyone can view events" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Moderators can create events" ON events FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM moderators WHERE moderators.id = auth.uid()));
CREATE POLICY "Moderators can update their own events" ON events FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Moderators can delete their own events" ON events FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Student Event policies
CREATE POLICY "Students can view their own signups" ON student_event FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Moderators can view signups for their events" ON student_event FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM events WHERE events.id = student_event.event_id AND events.created_by = auth.uid()));
CREATE POLICY "Students can create their own signups" ON student_event FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() AND EXISTS (SELECT 1 FROM students WHERE students.id = auth.uid()));
CREATE POLICY "Students can delete their own signups" ON student_event FOR DELETE TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Moderators can update signups for their events" ON student_event FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM events WHERE events.id = student_event.event_id AND events.created_by = auth.uid()));
```

Click **RUN**

**Script 3: Auto Profile Creation**

```sql
-- Create student profile function
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

-- Create moderator profile function
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

-- Create triggers
CREATE TRIGGER on_auth_user_created_student 
  AFTER INSERT ON auth.users 
  FOR EACH ROW 
  EXECUTE FUNCTION create_student_profile();

CREATE TRIGGER on_auth_user_created_moderator 
  AFTER INSERT ON auth.users 
  FOR EACH ROW 
  EXECUTE FUNCTION create_moderator_profile();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_event_updated_at 
  BEFORE UPDATE ON student_event 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

Click **RUN**

✅ Your database is now set up!

### Step 5: Disable Email Confirmation (Development Only)

For easier testing, disable email confirmations:

1. Go to **Authentication** → **Settings**
2. Find **"Enable email confirmations"**
3. **Uncheck** it
4. Click **Save**

⚠️ **Remember**: Re-enable this before going to production!

### Step 6: Start Your App

Back in your terminal, run:

```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

Your browser should automatically open to `http://localhost:3000`

🎉 **Congratulations!** Your app is running!

## 🧪 Test Your App

### Create a Moderator Account

1. Click **Sign up**
2. Select **Moderator**
3. Fill in:
   - First Name: Test
   - Last Name: Moderator
   - Email: mod@test.com (any email works)
   - Password: test123 (or anything 6+ characters)
4. Click **Create Account**
5. Click **Sign in** and log in

### Create Your First Event

1. Click **Create Event**
2. Fill in:
   - Title: "Food Drive"
   - Description: "Help collect food for families"
   - Location: "School Cafeteria"
   - Date & Time: Pick any future date
   - Capacity: 20
3. Click **Create Event**

✅ You should see your event in the dashboard!

### Create a Student Account

1. **Sign out** (top right)
2. Click **Sign up**
3. Select **Student**
4. Fill in:
   - First Name: Test
   - Last Name: Student
   - Email: student@kellenberg.org (or any email for testing)
   - Grade: 10
   - Password: test123
5. Click **Create Account**
6. Sign in

### Sign Up for the Event

1. You should see the "Food Drive" event
2. Click **Sign Up**
3. Go to **My Events** tab
4. You should see your signup with status "Pending"

### Approve the Signup (as Moderator)

1. Sign out
2. Sign in as moderator (mod@test.com)
3. Click **View Signups** on the Food Drive event
4. Click the ✓ (checkmark) next to the student's name
5. Status should change to "Approved"

🎊 **Perfect!** Everything is working!

## 📱 What's Next?

### Customize the App

1. **Change colors**: Edit `tailwind.config.js`
2. **Change branding**: Edit `src/components/Layout.jsx`
3. **Add features**: Explore the code in `src/`

### Learn the Code

- `src/pages/` - Main pages (Login, Dashboards)
- `src/components/` - Reusable UI components
- `src/contexts/AuthContext.jsx` - Authentication logic
- `src/hooks/useEvents.js` - Data fetching
- `src/utils/` - Helper functions

### Deploy to Production

When ready, see **DEPLOYMENT.md** for instructions on deploying to:
- Vercel (recommended)
- Netlify
- Your own server

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

**Fix**: 
1. Make sure `.env` file exists in project root
2. Check variable names are exact: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Restart the dev server (`npm run dev`)

### "User has no profile" after signup

**Fix**:
1. Check that Script 3 (triggers) ran successfully
2. Go to Database → Triggers in Supabase
3. You should see triggers listed
4. Delete the test user and try again

### Can't see events after creating them

**Fix**:
1. Make sure you're logged in
2. Refresh the page
3. Check browser console for errors (F12)

### "RLS policy violation" errors

**Fix**:
1. Make sure Script 2 (security policies) ran successfully
2. Check you're logged in as the correct user type
3. Verify the user has a profile in the database

### Port 3000 already in use

**Fix**:
```bash
# Kill the process using port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:3000 | xargs kill
```

## 💡 Tips

1. **Keep browser console open** (F12) to see errors
2. **Use Supabase Dashboard** to view data as you test
3. **Create multiple test accounts** for thorough testing
4. **Read the code comments** - they explain what everything does
5. **Experiment!** - You can't break anything, just reset the database

## 📚 Learning Resources

- [React Tutorial](https://react.dev/learn)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com)

## 🆘 Still Stuck?

1. Check the other documentation files
2. Review code comments in `src/`
3. Check Supabase logs in the dashboard
4. Search for the error message
5. Ask for help with specific error messages

## ✅ Success Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] Supabase project created
- [ ] `.env` file configured
- [ ] Database scripts run
- [ ] Email confirmation disabled
- [ ] App starts (`npm run dev`)
- [ ] Can sign up as moderator
- [ ] Can create events
- [ ] Can sign up as student
- [ ] Can sign up for events
- [ ] Can approve signups

---

**Congratulations on setting up SALT!** 🎉

You're now ready to start developing and customizing your service event management system.

**Happy coding!** 💻

