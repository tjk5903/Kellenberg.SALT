import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useModeratorEvents } from '../hooks/useEvents'
import Layout from '../components/Layout'
import ModeratorEventCard from '../components/ModeratorEventCard'
import CreateEventModal from '../components/CreateEventModal'
import Toast from '../components/Toast'
import { Calendar, Plus, Users, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import Button from '../components/Button'

export default function ModeratorDashboard() {
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const { events, loading, refetch } = useModeratorEvents(userProfile?.id)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [toast, setToast] = useState(null)

  const handleEventCreated = () => {
    refetch()
    setShowCreateModal(false)
    setToast({ type: 'success', message: 'Event created successfully!' })
  }

  const handleEventUpdated = () => {
    refetch()
  }

  const upcomingEvents = events.filter(e => new Date(e.start_date || e.date) >= new Date())
  const pastEvents = events.filter(e => new Date(e.start_date || e.date) < new Date())

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-kellenberg-royal via-blue-700 to-white rounded-xl shadow-2xl p-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">
                Moderator Dashboard
              </h1>
              <p className="text-kellenberg-gold text-lg font-semibold drop-shadow">
                Welcome back, {userProfile?.first_name}!
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-kellenberg-royal hover:bg-kellenberg-royal hover:text-white font-bold text-lg px-6 py-3 shadow-xl border-2 border-kellenberg-royal rounded-lg transition-all duration-300 inline-flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </button>
              <button
                onClick={() => navigate('/moderator/calendar')}
                className="bg-white text-kellenberg-royal hover:bg-kellenberg-royal hover:text-white font-bold text-lg px-6 py-3 shadow-xl border-2 border-kellenberg-royal rounded-lg transition-all duration-300 inline-flex items-center justify-center"
              >
                <CalendarDays className="w-5 h-5 mr-2" />
                Calendar View
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => navigate('/moderator/all-events')}
            className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-kellenberg-royal hover:shadow-2xl transition-all cursor-pointer hover:scale-105 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Events</p>
                <p className="text-4xl font-bold text-kellenberg-royal">{events.length}</p>
                <p className="text-xs text-kellenberg-royal font-semibold mt-1 group-hover:underline">
                  Click to view all →
                </p>
              </div>
              <div className="bg-kellenberg-gold/10 p-3 rounded-full">
                <Calendar className="w-10 h-10 text-kellenberg-gold" />
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/moderator/upcoming-events')}
            className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-kellenberg-royal hover:shadow-2xl transition-all cursor-pointer hover:scale-105 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Upcoming</p>
                <p className="text-4xl font-bold text-kellenberg-royal">{upcomingEvents.length}</p>
                <p className="text-xs text-kellenberg-royal font-semibold mt-1 group-hover:underline">
                  Click to view all →
                </p>
              </div>
              <div className="bg-kellenberg-gold/10 p-3 rounded-full">
                <Calendar className="w-10 h-10 text-kellenberg-gold" />
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/moderator/past-events')}
            className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-kellenberg-royal hover:shadow-2xl transition-all cursor-pointer hover:scale-105 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Past Events</p>
                <p className="text-4xl font-bold text-kellenberg-royal">{pastEvents.length}</p>
                <p className="text-xs text-kellenberg-royal font-semibold mt-1 group-hover:underline">
                  Click to view all →
                </p>
              </div>
              <div className="bg-kellenberg-gold/10 p-3 rounded-full">
                <Users className="w-10 h-10 text-kellenberg-gold" />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events Carousel */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-kellenberg-gold/20">
          <div className="px-6 py-5 bg-gradient-to-r from-kellenberg-royal/5 to-kellenberg-gold/5 border-b-2 border-kellenberg-gold flex justify-between items-center">
            <h2 className="text-2xl font-bold text-kellenberg-royal">
              Upcoming Events
              <span className="text-lg ml-2 text-gray-600">({upcomingEvents.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              {upcomingEvents.length > 1 && (
                <>
                  {carouselIndex > 0 && (
                    <button
                      onClick={() => setCarouselIndex(carouselIndex - 1)}
                      className="bg-kellenberg-royal text-white p-2 rounded-full shadow-lg hover:bg-kellenberg-gold hover:text-kellenberg-royal transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  {carouselIndex < upcomingEvents.length - 1 && (
                    <button
                      onClick={() => setCarouselIndex(carouselIndex + 1)}
                      className="bg-kellenberg-royal text-white p-2 rounded-full shadow-lg hover:bg-kellenberg-gold hover:text-kellenberg-royal transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kellenberg-royal mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading events...</p>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                <p className="text-gray-600 mb-6">Create your first event to get started!</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Event
                </Button>
              </div>
            ) : (
              /* Carousel View */
              <div>
                <div className="overflow-hidden">
                  <div 
                    className="transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                  >
                    <div className="flex">
                      {upcomingEvents.map(event => (
                        <div key={event.id} className="w-full flex-shrink-0 px-2">
                          <ModeratorEventCard 
                            event={event}
                            onUpdate={handleEventUpdated}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {upcomingEvents.length > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {upcomingEvents.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCarouselIndex(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === carouselIndex 
                            ? 'w-8 bg-kellenberg-royal' 
                            : 'w-2 bg-gray-300 hover:bg-kellenberg-gold'
                        }`}
                      />
                    ))}
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

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  )
}

