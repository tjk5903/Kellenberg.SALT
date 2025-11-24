import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useEvents, useStudentEventSignups } from '../hooks/useEvents'
import Layout from '../components/Layout'
import EventCard from '../components/EventCard'
import StudentSignupCard from '../components/StudentSignupCard'
import { Calendar, Clock, MapPin } from 'lucide-react'

export default function StudentDashboard() {
  const { userProfile } = useAuth()
  const { events, loading: eventsLoading, refetch: refetchEvents } = useEvents()
  const { signups, loading: signupsLoading, refetch: refetchSignups } = useStudentEventSignups(userProfile?.id)
  const [activeTab, setActiveTab] = useState('available') // 'available' or 'my-events'

  const handleSignupSuccess = () => {
    refetchEvents()
    refetchSignups()
  }

  // Filter events that student hasn't signed up for yet
  const availableEvents = events.filter(event => {
    const isSignedUp = signups.some(signup => signup.event_id === event.id)
    return !isSignedUp
  })

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-kellenberg-maroon to-red-800 rounded-xl shadow-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {userProfile?.first_name}!
          </h1>
          <p className="text-kellenberg-gold">
            Explore service events and track your participation
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Signups</p>
                <p className="text-3xl font-bold text-kellenberg-maroon">{signups.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-kellenberg-gold" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {signups.filter(s => s.status === 'Approved').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {signups.filter(s => s.status === 'Pending').length}
                </p>
              </div>
              <MapPin className="w-10 h-10 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('available')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'available'
                    ? 'border-kellenberg-maroon text-kellenberg-maroon'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                Available Events ({availableEvents.length})
              </button>
              <button
                onClick={() => setActiveTab('my-events')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'my-events'
                    ? 'border-kellenberg-maroon text-kellenberg-maroon'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                My Events ({signups.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Available Events Tab */}
            {activeTab === 'available' && (
              <div>
                {eventsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kellenberg-maroon mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading events...</p>
                  </div>
                ) : availableEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events available</h3>
                    <p className="text-gray-600">Check back later for new service opportunities!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {availableEvents.map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        studentId={userProfile?.id}
                        onSignupSuccess={handleSignupSuccess}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Events Tab */}
            {activeTab === 'my-events' && (
              <div>
                {signupsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kellenberg-maroon mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your events...</p>
                  </div>
                ) : signups.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No signups yet</h3>
                    <p className="text-gray-600">Sign up for events to see them here!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {signups.map(signup => (
                      <StudentSignupCard 
                        key={signup.id} 
                        signup={signup}
                        onCancelSuccess={handleSignupSuccess}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

