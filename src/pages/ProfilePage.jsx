import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import { ArrowLeft, User, Mail, Calendar, GraduationCap } from 'lucide-react'
import Button from '../components/Button'

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

        {/* Title Section */}
        <div className="bg-gradient-to-r from-kellenberg-royal via-blue-700 to-white rounded-xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">
            My Profile
          </h1>
          <p className="text-kellenberg-gold text-lg font-semibold drop-shadow">
            View and manage your information
          </p>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-kellenberg-gold/20">
          <div className="px-6 py-5 bg-gradient-to-r from-kellenberg-royal/5 to-kellenberg-gold/5 border-b-2 border-kellenberg-gold">
            <h2 className="text-2xl font-bold text-kellenberg-royal">
              Personal Information
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Name */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-kellenberg-royal/10 p-3 rounded-full">
                <User className="w-6 h-6 text-kellenberg-royal" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="text-lg font-semibold text-gray-900">
                  {userProfile?.first_name} {userProfile?.last_name}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-kellenberg-gold/10 p-3 rounded-full">
                <Mail className="w-6 h-6 text-kellenberg-gold" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-semibold text-gray-900">
                  {userProfile?.email}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-kellenberg-royal/10 p-3 rounded-full">
                <User className="w-6 h-6 text-kellenberg-royal" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {userRole}
                </p>
              </div>
            </div>

            {/* Student-specific fields */}
            {userRole === 'student' && (
              <>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-kellenberg-gold/10 p-3 rounded-full">
                    <GraduationCap className="w-6 h-6 text-kellenberg-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Grade</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {userProfile?.grade}th Grade
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-kellenberg-royal/10 p-3 rounded-full">
                    <Calendar className="w-6 h-6 text-kellenberg-royal" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Registration Year</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {userProfile?.registration_year}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Account Created */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-kellenberg-gold/10 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-kellenberg-gold" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Created</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(userProfile?.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

