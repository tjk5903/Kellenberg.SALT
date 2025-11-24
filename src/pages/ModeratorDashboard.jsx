import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useModeratorEvents } from '../hooks/useEvents'
import Layout from '../components/Layout'
import ModeratorEventCard from '../components/ModeratorEventCard'
import CreateEventModal from '../components/CreateEventModal'
import { Calendar, Plus, Users } from 'lucide-react'
import Button from '../components/Button'

export default function ModeratorDashboard() {
  const { userProfile } = useAuth()
  const { events, loading, refetch } = useModeratorEvents(userProfile?.id)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleEventCreated = () => {
    refetch()
    setShowCreateModal(false)
  }

  const handleEventUpdated = () => {
    refetch()
  }

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date())
  const pastEvents = events.filter(e => new Date(e.date) < new Date())

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-kellenberg-maroon to-red-800 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Moderator Dashboard
              </h1>
              <p className="text-kellenberg-gold">
                Welcome back, {userProfile?.first_name}!
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-kellenberg-maroon hover:bg-kellenberg-gold hover:text-kellenberg-maroon"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Events</p>
                <p className="text-3xl font-bold text-kellenberg-maroon">{events.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-kellenberg-gold" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Upcoming</p>
                <p className="text-3xl font-bold text-blue-600">{upcomingEvents.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Past Events</p>
                <p className="text-3xl font-bold text-gray-600">{pastEvents.length}</p>
              </div>
              <Users className="w-10 h-10 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Your Events</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kellenberg-maroon mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                <p className="text-gray-600 mb-6">Create your first event to get started!</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Event
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {upcomingEvents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Upcoming Events ({upcomingEvents.length})
                    </h3>
                    <div className="space-y-4">
                      {upcomingEvents.map(event => (
                        <ModeratorEventCard 
                          key={event.id} 
                          event={event}
                          onUpdate={handleEventUpdated}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {pastEvents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-500 mb-3">
                      Past Events ({pastEvents.length})
                    </h3>
                    <div className="space-y-4 opacity-75">
                      {pastEvents.map(event => (
                        <ModeratorEventCard 
                          key={event.id} 
                          event={event}
                          onUpdate={handleEventUpdated}
                          isPast
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleEventCreated}
          moderatorId={userProfile?.id}
        />
      )}
    </Layout>
  )
}

