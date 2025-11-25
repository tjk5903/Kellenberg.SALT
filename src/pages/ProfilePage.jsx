import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import { ArrowLeft, User, Mail, Calendar, GraduationCap, Award, Home, Shield } from 'lucide-react'
import Button from '../components/Button'
import { formatHours } from '../utils/formatters'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { userProfile, userRole } = useAuth()

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/${userRole}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header Card */}
        <div className="bg-gradient-to-r from-kellenberg-royal via-blue-700 to-white rounded-xl shadow-2xl p-8">
          <div className="flex items-center gap-6">
            <div className="bg-white/20 backdrop-blur-sm p-5 rounded-full">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                {userProfile?.first_name} {userProfile?.last_name}
              </h1>
              <p className="text-kellenberg-gold text-lg font-semibold drop-shadow flex items-center gap-2 mt-1">
                <Shield className="w-5 h-5" />
                <span className="capitalize">{userRole}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box 1: Service Hours (Top Left) - Students Only */}
          {userRole === 'student' && (
            <div className="bg-gradient-to-br from-kellenberg-gold via-yellow-500 to-kellenberg-gold rounded-xl shadow-2xl p-6 border-2 border-kellenberg-gold">
              <h3 className="text-xl font-bold text-white drop-shadow-lg mb-3 flex items-center gap-2">
                <Award className="w-6 h-6" />
                Service Hours
              </h3>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl text-center mb-4">
                <p className="text-5xl font-bold text-white drop-shadow-lg">
                  {(userProfile?.total_hours || 0).toFixed(1)}
                </p>
                <p className="text-white/90 text-sm mt-1">of 20 hours</p>
              </div>
              
              <div className="relative w-full bg-white/30 backdrop-blur-sm rounded-full h-3 overflow-hidden mb-2">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    (userProfile?.total_hours || 0) >= 20 ? 'bg-green-500' : 
                    (userProfile?.total_hours || 0) >= 10 ? 'bg-white' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(((userProfile?.total_hours || 0) / 20) * 100, 100)}%` }}
                />
              </div>
              
              <div className="text-center text-white/90 text-sm font-medium mb-3">
                {Math.min(((userProfile?.total_hours || 0) / 20) * 100, 100).toFixed(0)}% Complete
              </div>

              {(userProfile?.total_hours || 0) >= 20 ? (
                <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-center font-bold text-sm">
                  ✓ Requirement Met!
                </div>
              ) : (
                <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-center text-sm">
                  <span className="font-bold">{(20 - (userProfile?.total_hours || 0)).toFixed(1)}</span> hours remaining
                </div>
              )}
            </div>
          )}

          {/* Box 1 Alternative: Personal Info (Top Left) - Moderators Only */}
          {userRole === 'moderator' && (
            <div className="bg-white rounded-xl shadow-2xl p-6 border-l-4 border-kellenberg-royal">
              <h3 className="text-xl font-bold text-kellenberg-royal mb-4 flex items-center gap-2">
                <User className="w-6 h-6" />
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {userProfile?.first_name} {userProfile?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email Address</p>
                  <p className="text-base font-semibold text-gray-900">{userProfile?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Role</p>
                  <p className="text-base font-semibold text-gray-900 capitalize">{userRole}</p>
                </div>
              </div>
            </div>
          )}

          {/* Box 2: Contact Information (Top Right) */}
          <div className="bg-white rounded-xl shadow-2xl p-6 border-l-4 border-kellenberg-royal">
            <h3 className="text-xl font-bold text-kellenberg-royal mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email Address</p>
                <p className="text-base font-semibold text-gray-900 break-all">{userProfile?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Full Name</p>
                <p className="text-base font-semibold text-gray-900">
                  {userProfile?.first_name} {userProfile?.last_name}
                </p>
              </div>
            </div>
          </div>

          {/* Box 3: Academic Information (Bottom Left) - Students Only */}
          {userRole === 'student' && (
            <div className="bg-white rounded-xl shadow-2xl p-6 border-l-4 border-kellenberg-gold">
              <h3 className="text-xl font-bold text-kellenberg-gold mb-4 flex items-center gap-2">
                <GraduationCap className="w-6 h-6" />
                Academic Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Grade</p>
                    <p className="text-2xl font-bold text-gray-900">{userProfile?.grade}th</p>
                  </div>
                  {userProfile?.homeroom && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Homeroom</p>
                      <p className="text-2xl font-bold text-gray-900">{userProfile?.homeroom}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Graduation Year</p>
                  <p className="text-lg font-semibold text-gray-900">Class of {userProfile?.registration_year}</p>
                </div>
              </div>
            </div>
          )}

          {/* Box 3 Alternative: Account Stats (Bottom Left) - Moderators Only */}
          {userRole === 'moderator' && (
            <div className="bg-white rounded-xl shadow-2xl p-6 border-l-4 border-kellenberg-gold">
              <h3 className="text-xl font-bold text-kellenberg-gold mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Account Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Member Since</p>
                  <p className="text-base font-semibold text-gray-900">
                    {new Date(userProfile?.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Box 4: Account Information (Bottom Right) */}
          <div className="bg-white rounded-xl shadow-2xl p-6 border-l-4 border-kellenberg-royal">
            <h3 className="text-xl font-bold text-kellenberg-royal mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Account Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Member Since</p>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(userProfile?.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Account Type</p>
                <p className="text-base font-semibold text-gray-900 capitalize">{userRole}</p>
              </div>
              {userRole === 'student' && userProfile?.agreed_to_terms && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Agreement Status</p>
                  <p className="text-sm font-semibold text-green-600 flex items-center gap-1">
                    ✓ Terms Accepted
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

