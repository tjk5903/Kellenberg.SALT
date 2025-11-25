import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEvents, useStudentEventSignups } from '../hooks/useEvents'
import Layout from '../components/Layout'
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react'
import Button from '../components/Button'
import { formatTime } from '../utils/formatters'
import { signUpForEvent } from '../utils/eventHelpers'
import Toast from '../components/Toast'

export default function StudentCalendarPage() {
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const { events, loading } = useEvents()
  const { signups, refetch: refetchSignups } = useStudentEventSignups(userProfile?.id)
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedDayEvents, setSelectedDayEvents] = useState(null)
  const [toast, setToast] = useState(null)
  const [signingUp, setSigningUp] = useState(false)

  // Get calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startingDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    
    const weeks = []
    let currentWeek = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      currentWeek.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start_date || event.date)
        return eventDate.getFullYear() === year &&
               eventDate.getMonth() === month &&
               eventDate.getDate() === day
      })
      
      currentWeek.push({ date, day, events: dayEvents })
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      weeks.push(currentWeek)
    }
    
    return weeks
  }, [currentDate, events])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const today = new Date()
  const isToday = (date) => {
    if (!date) return false
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const isSignedUp = (eventId) => {
    return signups.some(signup => signup.event_id === eventId)
  }

  const isPastEvent = (event) => {
    return new Date(event.start_date || event.date) < new Date()
  }

  const handleSignUp = async () => {
    if (!selectedEvent || !userProfile?.id) return
    
    setSigningUp(true)
    const { error } = await signUpForEvent(userProfile.id, selectedEvent.id)
    setSigningUp(false)

    if (error) {
      setToast({ type: 'error', message: 'Failed to sign up for event' })
    } else {
      setToast({ type: 'success', message: 'Successfully signed up for event!' })
      refetchSignups()
      setSelectedEvent(null)
    }
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
        <div className="bg-gradient-to-r from-kellenberg-royal via-blue-700 to-white rounded-xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">
            Calendar View
          </h1>
          <p className="text-kellenberg-gold text-lg font-semibold drop-shadow">
            View all service events in calendar format
          </p>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-kellenberg-gold/20">
          {/* Calendar Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-kellenberg-royal/5 to-kellenberg-gold/5 border-b-2 border-kellenberg-gold">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <h2 className="text-2xl font-bold text-kellenberg-royal">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                {/* Legend */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-kellenberg-gold/20 border-2 border-kellenberg-gold rounded"></div>
                    <span className="text-gray-700 font-medium">Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-kellenberg-gold/30 border border-kellenberg-gold rounded"></div>
                    <span className="text-gray-700 font-medium">Event</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-kellenberg-royal/10 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-kellenberg-royal" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm font-medium text-kellenberg-royal hover:bg-kellenberg-royal/10 rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-kellenberg-royal/10 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-kellenberg-royal" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map(day => (
                <div
                  key={day}
                  className="text-center font-semibold text-gray-700 py-2 text-sm"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarData.map((week, weekIndex) => (
                week.map((dayData, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`min-h-[120px] border rounded-lg p-2 relative ${
                      dayData
                        ? isToday(dayData.date)
                          ? 'bg-kellenberg-gold/10 border-kellenberg-gold'
                          : 'bg-gray-50 border-gray-200'
                        : 'bg-gray-100 border-gray-200'
                    }`}
                  >
                    {dayData && (
                      <>
                        <div className={`absolute top-2 left-2 text-sm font-semibold ${
                          isToday(dayData.date) ? 'text-kellenberg-royal' : 'text-gray-700'
                        }`}>
                          {dayData.day}
                        </div>
                        <div className="pt-7 space-y-1">
                          {dayData.events.slice(0, 2).map(event => (
                            <button
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className="w-full text-left px-2 py-1 bg-kellenberg-gold/30 text-black rounded text-xs hover:bg-kellenberg-gold/50 transition-colors border border-kellenberg-gold"
                              title={event.title}
                            >
                              <div className="font-semibold truncate">{event.title}</div>
                              {event.start_date && (
                                <div className="text-gray-700 text-[10px] font-medium">
                                  {formatTime(event.start_date)}
                                </div>
                              )}
                            </button>
                          ))}
                          {dayData.events.length > 2 && (
                            <button
                              onClick={() => setSelectedDayEvents({ date: dayData.date, events: dayData.events })}
                              className="w-full text-xs text-kellenberg-royal font-semibold px-2 py-1 bg-kellenberg-royal/10 rounded border border-kellenberg-royal/30 hover:bg-kellenberg-royal/20 transition-colors"
                            >
                              +{dayData.events.length - 2} more
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-kellenberg-royal mb-4">
              {selectedEvent.title}
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-kellenberg-royal mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Time</p>
                  <p className="text-gray-700">
                    {formatTime(selectedEvent.start_date || selectedEvent.date)}
                    {selectedEvent.end_date && ` - ${formatTime(selectedEvent.end_date)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-kellenberg-royal mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-gray-700">{selectedEvent.location}</p>
                </div>
              </div>

              <div>
                <p className="font-medium text-gray-900 mb-1">Description</p>
                <p className="text-gray-700">{selectedEvent.description}</p>
              </div>

              {selectedEvent.capacity && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-kellenberg-royal mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Capacity</p>
                    <p className="text-gray-700">{selectedEvent.capacity} students</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!isSignedUp(selectedEvent.id) && !isPastEvent(selectedEvent) ? (
                <Button
                  onClick={handleSignUp}
                  variant="primary"
                  fullWidth
                  loading={signingUp}
                  disabled={signingUp}
                >
                  Sign Up
                </Button>
              ) : isSignedUp(selectedEvent.id) ? (
                <div className="flex-1 bg-green-100 text-green-700 font-medium px-4 py-2 rounded-lg text-center border-2 border-green-500">
                  Already Signed Up ✓
                </div>
              ) : (
                <div className="flex-1 bg-gray-100 text-gray-600 font-medium px-4 py-2 rounded-lg text-center">
                  Event Passed
                </div>
              )}
              <Button
                onClick={() => setSelectedEvent(null)}
                variant="ghost"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Day Events Modal */}
      {selectedDayEvents && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedDayEvents(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
              <h3 className="text-2xl font-bold text-kellenberg-royal">
                Events on {selectedDayEvents.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <p className="text-gray-600 text-sm mt-1">{selectedDayEvents.events.length} events</p>
            </div>
            
            <div className="p-6 space-y-3">
              {selectedDayEvents.events.map(event => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event)
                    setSelectedDayEvents(null)
                  }}
                  className="w-full text-left p-4 bg-gray-50 hover:bg-kellenberg-gold/10 rounded-lg border border-gray-200 hover:border-kellenberg-gold transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-kellenberg-royal text-lg mb-1">{event.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatTime(event.start_date || event.date)}
                            {event.end_date && ` - ${formatTime(event.end_date)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-2">{event.description}</p>
                    </div>
                    {isSignedUp(event.id) ? (
                      <div className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                        Signed Up ✓
                      </div>
                    ) : isPastEvent(event) ? (
                      <div className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                        Past
                      </div>
                    ) : (
                      <div className="bg-kellenberg-gold/20 text-kellenberg-royal text-xs font-semibold px-3 py-1 rounded-full">
                        Available
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-xl">
              <Button
                onClick={() => setSelectedDayEvents(null)}
                variant="ghost"
                fullWidth
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  )
}

