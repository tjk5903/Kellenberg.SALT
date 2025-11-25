import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useStudentEventSignups } from '../hooks/useEvents'
import Layout from '../components/Layout'
import StudentSignupCard from '../components/StudentSignupCard'
import { ArrowLeft, Clock } from 'lucide-react'
import Button from '../components/Button'

export default function PendingSignupsPage() {
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const { signups, loading, refetch } = useStudentEventSignups(userProfile?.id)

  const pendingSignups = signups.filter(s => s.status === 'Pending')

  const handleCancelSuccess = () => {
    refetch()
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kellenberg-royal"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/student')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Button>
        </div>

        {/* Title Section */}
        <div className="bg-gradient-to-r from-kellenberg-gold via-yellow-400 to-white rounded-xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold mb-2 text-kellenberg-royal drop-shadow-lg">
            Pending Events
          </h1>
          <p className="text-kellenberg-royal text-lg font-semibold drop-shadow">
            Events awaiting moderator approval
          </p>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-kellenberg-gold/20">
          <div className="px-6 py-5 bg-gradient-to-r from-kellenberg-gold/5 to-white border-b-2 border-kellenberg-gold">
            <h2 className="text-2xl font-bold text-kellenberg-gold">
              {pendingSignups.length} Pending {pendingSignups.length === 1 ? 'Event' : 'Events'}
            </h2>
          </div>

          <div className="p-6">
            {pendingSignups.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending events</h3>
                <p className="text-gray-600">All your signups have been reviewed!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSignups.map(signup => (
                  <StudentSignupCard 
                    key={signup.id} 
                    signup={signup}
                    onCancelSuccess={handleCancelSuccess}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

