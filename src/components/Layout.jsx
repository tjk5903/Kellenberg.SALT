import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, ChevronDown, Info } from 'lucide-react'

export default function Layout({ children }) {
  const { user, userProfile, userRole, signOut } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-kellenberg-royal via-blue-700 to-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">S.A.L.T</h1>
              <p className="text-kellenberg-gold text-xs font-medium">
                Service • Allegiance • Leadership • Teamwork
              </p>
            </div>
            
            {user && userProfile && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-white font-medium text-sm">
                      {userProfile.first_name} {userProfile.last_name}
                    </p>
                    <p className="text-kellenberg-gold text-xs capitalize">
                      {userRole}
                      {userRole === 'student' && userProfile.grade && ` • Grade ${userProfile.grade}`}
                    </p>
                  </div>
                  <div className="sm:hidden">
                    <User className="w-5 h-5" />
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-kellenberg-gold/20 py-2 z-50">
                    {/* Mobile: Show name at top */}
                    <div className="sm:hidden px-4 py-3 border-b border-gray-200">
                      <p className="text-gray-900 font-medium text-sm">
                        {userProfile.first_name} {userProfile.last_name}
                      </p>
                      <p className="text-kellenberg-gold text-xs capitalize">
                        {userRole}
                        {userRole === 'student' && userProfile.grade && ` • Grade ${userProfile.grade}`}
                      </p>
                    </div>

                    {/* Profile Option */}
                    <button
                      onClick={() => {
                        navigate(`/${userRole}/profile`)
                        setShowDropdown(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-kellenberg-royal/5 flex items-center gap-3 transition-colors"
                    >
                      <User className="w-5 h-5 text-kellenberg-royal" />
                      <div>
                        <p className="font-medium text-sm">Profile</p>
                        <p className="text-xs text-gray-500">View your profile</p>
                      </div>
                    </button>

                    {/* Info Option */}
                    <button
                      onClick={() => {
                        navigate('/info')
                        setShowDropdown(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-kellenberg-royal/5 flex items-center gap-3 transition-colors"
                    >
                      <Info className="w-5 h-5 text-kellenberg-royal" />
                      <div>
                        <p className="font-medium text-sm">Information</p>
                        <p className="text-xs text-gray-500">About SALT</p>
                      </div>
                    </button>

                    <div className="border-t border-gray-200 my-2"></div>

                    {/* Sign Out Option */}
                    <button
                      onClick={() => {
                        handleSignOut()
                        setShowDropdown(false)
                      }}
                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <div>
                        <p className="font-medium text-sm">Sign Out</p>
                        <p className="text-xs text-red-500">Logout from SALT</p>
                      </div>
                    </button>
                  </div>
                )}
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

