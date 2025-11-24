# SALT - Service Allegiance Leadership Teamwork

A modern web application for Kellenberg Memorial High School students and moderators to manage service events and track participation.

## Features

### For Students
- 📅 View available service events
- ✍️ Sign up for events
- 📊 Track signup status (Pending/Approved/Not Needed)
- 📈 View personal participation statistics
- ❌ Cancel pending signups

### For Moderators
- 🎯 Create and manage events
- 👥 View and manage student signups
- ✅ Approve or mark signups as "Not Needed"
- 📥 Export signup lists to CSV
- 📊 View event statistics

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Kellenberg.SALT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase** (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))

5. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Input.jsx
│   ├── Layout.jsx
│   ├── ProtectedRoute.jsx
│   ├── EventCard.jsx
│   ├── StudentSignupCard.jsx
│   ├── ModeratorEventCard.jsx
│   ├── CreateEventModal.jsx
│   ├── EditEventModal.jsx
│   └── ViewSignupsModal.jsx
├── contexts/           # React Context providers
│   └── AuthContext.jsx
├── hooks/             # Custom React hooks
│   └── useEvents.js
├── lib/               # Third-party library configurations
│   └── supabase.js
├── pages/             # Page components
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── StudentDashboard.jsx
│   └── ModeratorDashboard.jsx
├── utils/             # Utility functions
│   ├── eventHelpers.js
│   └── formatters.js
├── App.jsx            # Main app component with routing
├── main.jsx           # Application entry point
└── index.css          # Global styles
```

## Authentication Flow

1. Users sign up with email and password
2. Students must use `@kellenberg.org` email addresses
3. After signup, users need to verify their email (can be disabled in Supabase for development)
4. User profiles are stored in either `students` or `moderators` tables
5. Row Level Security (RLS) policies ensure users can only access their own data

## Database Schema

- **students**: Student profiles with grade and registration year
- **moderators**: Moderator profiles
- **events**: Service events created by moderators
- **student_event**: Join table for student signups with approval status
- **audit_log**: (Optional) Track changes for compliance

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed schema and RLS policies.

## Key Features Explained

### Row Level Security (RLS)
All database operations respect RLS policies:
- Students can only view/update their own records
- Moderators can only manage events they created
- Signups are restricted based on ownership

### Real-time Updates
The app uses Supabase real-time features to keep data in sync across users.

### Status Management
Student signups have three statuses:
- **Pending**: Waiting for moderator review
- **Approved**: Moderator confirmed participation
- **Not Needed**: Moderator determined participation wasn't required

### CSV Export
Moderators can export signup lists with:
- Student information (name, email, grade)
- Signup status
- Registration details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

© 2024 Kellenberg Memorial High School. All rights reserved.

## Support

For issues or questions, please contact the development team or open an issue on GitHub.

