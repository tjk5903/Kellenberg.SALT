import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'

export default function Layout({ children }) {
  const { user, userProfile, userRole, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-kellenberg-maroon shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-kellenberg-gold p-2 rounded-lg">
                <span className="text-2xl font-bold text-kellenberg-maroon">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">SALT</h1>
                <p className="text-kellenberg-gold text-xs font-medium">
                  Service • Allegiance • Leadership • Teamwork
                </p>
              </div>
            </div>
            
            {user && userProfile && (
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-white font-medium">
                    {userProfile.first_name} {userProfile.last_name}
                  </p>
                  <p className="text-kellenberg-gold text-sm capitalize">
                    {userRole}
                    {userRole === 'student' && userProfile.grade && ` • Grade ${userProfile.grade}`}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} Kellenberg Memorial High School</p>
      </footer>
    </div>
  )
}

