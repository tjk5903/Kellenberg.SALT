import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useModeratorEvents } from '../hooks/useEvents'
import Layout from '../components/Layout'
import ModeratorEventCard from '../components/ModeratorEventCard'
import { ArrowLeft, Calendar } from 'lucide-react'
import Button from '../components/Button'

export default function PastEventsPage() {
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const { events, loading, refetch } = useModeratorEvents(userProfile?.id)

  const pastEvents = events.filter(e => new Date(e.start_date || e.date) < new Date())

  const handleEventUpdated = () => {
    refetch()
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/moderator')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Button>
        </div>

        {/* Title Section */}
        <div className="bg-gradient-to-r from-kellenberg-royal via-blue-700 to-white rounded-xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">
            Past Events
          </h1>
          <p className="text-kellenberg-gold text-lg font-semibold drop-shadow">
            Review your completed events
          </p>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-kellenberg-gold/20">
          <div className="px-6 py-5 bg-gradient-to-r from-kellenberg-royal/5 to-kellenberg-gold/5 border-b-2 border-kellenberg-gold">
            <h2 className="text-2xl font-bold text-kellenberg-royal">
              Past Events ({pastEvents.length})
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kellenberg-royal mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading events...</p>
              </div>
            ) : pastEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No past events</h3>
                <p className="text-gray-600">Your past events will appear here</p>
              </div>
            ) : (
              <div className="space-y-4 opacity-75">
                {pastEvents.map(event => (
                  <ModeratorEventCard 
                    key={event.id} 
                    event={event}
                    onUpdate={handleEventUpdated}
                    isPast={true}
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

