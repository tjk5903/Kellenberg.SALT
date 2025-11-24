# 🚀 Quick Start Guide

Get your SALT application up and running in minutes!

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Supabase Account** - [Sign up free](https://supabase.com)

## 1️⃣ Install Dependencies

```bash
npm install
```

This will install all required packages including React, Supabase client, Tailwind CSS, and more.

## 2️⃣ Set Up Supabase

### Create Your Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize (2-3 minutes)

### Get Your Credentials

1. Navigate to **Settings** → **API**
2. Copy your:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### Configure Environment

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Important**: Never commit the `.env` file to Git!

## 3️⃣ Set Up Database

Go to your Supabase project → **SQL Editor** and run these commands:

### A. Create Tables

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

-- Indexes
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_student_event_student_id ON student_event(student_id);
CREATE INDEX idx_student_event_event_id ON student_event(event_id);
```

### B. Enable Row Level Security

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

### C. Create Auto-Profile Triggers

```sql
-- Function to create student profile
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

-- Function to create moderator profile
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

-- Triggers
CREATE TRIGGER on_auth_user_created_student AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION create_student_profile();
CREATE TRIGGER on_auth_user_created_moderator AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION create_moderator_profile();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_event_updated_at BEFORE UPDATE ON student_event FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 4️⃣ Configure Email (Optional for Development)

For development, you can **disable email confirmations**:

1. Go to **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. Uncheck **"Enable email confirmations"**
4. Save changes

⚠️ **Important**: Re-enable this for production!

## 5️⃣ Run the Application

```bash
npm run dev
```

Your app will open at `http://localhost:3000` 🎉

## 6️⃣ Test the Application

### Create a Moderator Account

1. Click **Sign Up**
2. Choose **Moderator**
3. Fill in details (use any email)
4. Click **Create Account**
5. Sign in with your credentials

### Create an Event

1. Click **Create Event**
2. Fill in event details
3. Submit

### Create a Student Account

1. Sign out
2. Click **Sign Up**
3. Choose **Student**
4. Use a `@kellenberg.org` email (or any email for testing)
5. Select your grade
6. Create account and sign in

### Sign Up for an Event

1. View available events
2. Click **Sign Up** on an event
3. Check **My Events** tab to see your signup

### Approve Signups (as Moderator)

1. Sign in as moderator
2. Click **View Signups** on an event
3. Click the ✓ button to approve student signups

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to customize the Kellenberg colors:

```js
colors: {
  kellenberg: {
    maroon: '#800000',  // Change this
    gold: '#FFD700',    // Change this
  }
}
```

### App Name

1. Update `index.html` title
2. Update `src/components/Layout.jsx` header
3. Update `README.md`

## 📁 Project Structure

```
Kellenberg.SALT/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React Context (Auth)
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Supabase config
│   ├── pages/          # Page components
│   ├── utils/          # Helper functions
│   ├── App.jsx         # Main app + routing
│   └── main.jsx        # Entry point
├── .env                # Environment variables (create this)
├── package.json        # Dependencies
└── README.md          # Documentation
```

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check your `.env` file exists in the root directory
- Verify the variable names are correct: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after creating `.env`

### "User has no profile"
- Make sure the trigger functions are created
- Check that you selected Student/Moderator during signup
- Verify the triggers are working in Supabase → Database → Triggers

### Can't sign up / Authentication errors
- Check Authentication is enabled in Supabase dashboard
- Verify your API keys are correct
- Check browser console for specific error messages

### Students can't see events
- Make sure you're signed in as a student
- Check that events exist (create one as a moderator)
- Verify RLS policies are set up correctly

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed feature documentation
- Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for advanced database configuration
- Explore the code in `src/` to understand how it works
- Customize the design to match your school's branding

## 🆘 Need Help?

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [React Documentation](https://react.dev)
- Look at code comments for implementation details
- Open an issue on GitHub

---

**Happy coding!** 🎓✨

