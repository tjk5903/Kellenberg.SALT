import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import StudentDashboard from './pages/StudentDashboard'
import ModeratorDashboard from './pages/ModeratorDashboard'
import AllEventsPage from './pages/AllEventsPage'
import UpcomingEventsPage from './pages/UpcomingEventsPage'
import PastEventsPage from './pages/PastEventsPage'
import ProfilePage from './pages/ProfilePage'
import InfoPage from './pages/InfoPage'
import CalendarPage from './pages/CalendarPage'
import AllSignupsPage from './pages/AllSignupsPage'
import ApprovedSignupsPage from './pages/ApprovedSignupsPage'
import PendingSignupsPage from './pages/PendingSignupsPage'
import StudentCalendarPage from './pages/StudentCalendarPage'

function RootRedirect() {
  const { user, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kellenberg-royal"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (userRole === 'student') {
    return <Navigate to="/student" />
  } else if (userRole === 'moderator') {
    return <Navigate to="/moderator" />
  }

  return <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Student routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute requiredRole="student">
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/all-signups"
            element={
              <ProtectedRoute requiredRole="student">
                <AllSignupsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/approved-signups"
            element={
              <ProtectedRoute requiredRole="student">
                <ApprovedSignupsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/pending-signups"
            element={
              <ProtectedRoute requiredRole="student">
                <PendingSignupsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/calendar"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentCalendarPage />
              </ProtectedRoute>
            }
          />

          {/* Moderator routes */}
          <Route
            path="/moderator"
            element={
              <ProtectedRoute requiredRole="moderator">
                <ModeratorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/moderator/all-events"
            element={
              <ProtectedRoute requiredRole="moderator">
                <AllEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/moderator/upcoming-events"
            element={
              <ProtectedRoute requiredRole="moderator">
                <UpcomingEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/moderator/past-events"
            element={
              <ProtectedRoute requiredRole="moderator">
                <PastEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/moderator/profile"
            element={
              <ProtectedRoute requiredRole="moderator">
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/moderator/calendar"
            element={
              <ProtectedRoute requiredRole="moderator">
                <CalendarPage />
              </ProtectedRoute>
            }
          />

          {/* Shared routes (accessible to both roles) */}
          <Route
            path="/info"
            element={
              <ProtectedRoute>
                <InfoPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App

