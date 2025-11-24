import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useModeratorEvents } from '../hooks/useEvents'
import Layout from '../components/Layout'
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, MapPin, Plus, Edit, Trash2 } from 'lucide-react'
import Button from '../components/Button'
import { formatTime } from '../utils/formatters'
import CreateEventModal from '../components/CreateEventModal'
import EditEventModal from '../components/EditEventModal'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import { deleteEvent } from '../utils/eventHelpers'

export default function CalendarPage() {
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const { events, loading, refetch } = useModeratorEvents(userProfile?.id)
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [prefilledDate, setPrefilledDate] = useState(null)
  const [toast, setToast] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Get calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)
    
    // Get day of week for first day (0 = Sunday)
    const startingDayOfWeek = firstDay.getDay()
    
    // Total days in month
    const daysInMonth = lastDay.getDate()
    
    // Create array of weeks
    const weeks = []
    let currentWeek = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      currentWeek.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      
      // Get events for this day
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start_date || event.date)
        return eventDate.getFullYear() === year &&
               eventDate.getMonth() === month &&
               eventDate.getDate() === day
      })
      
      currentWeek.push({ date, day, events: dayEvents })
      
      // If week is complete (7 days), add to weeks array
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }
    
    // Add remaining empty cells to complete last week
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

  const handleDateClick = (date) => {
    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}T09:00` // Default to 9 AM
    setPrefilledDate(dateString)
    setShowCreateModal(true)
  }

  const handleEventCreated = () => {
    refetch()
    setShowCreateModal(false)
    setPrefilledDate(null)
    setToast({ type: 'success', message: 'Event created successfully!' })
  }

  const handleEventUpdated = () => {
    refetch()
    setShowEditModal(false)
    setSelectedEvent(null)
    setToast({ type: 'success', message: 'Event updated successfully!' })
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return
    
    setDeleteLoading(true)
    const { error } = await deleteEvent(selectedEvent.id)
    setDeleteLoading(false)

    if (error) {
      setToast({ type: 'error', message: 'Failed to delete event' })
    } else {
      setToast({ type: 'success', message: 'Event deleted successfully!' })
      refetch()
      setShowDeleteConfirm(false)
      setSelectedEvent(null)
    }
  }

  const handleEditClick = () => {
    setShowEditModal(true)
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
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
            onClick={() => navigate('/moderator')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Button>
        </div>

        {/* Title Section */}
        <div className="bg-gradient-to-r from-kellenberg-royal via-blue-700 to-white rounded-xl shadow-2xl p-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">
                Calendar View
              </h1>
              <p className="text-kellenberg-gold text-lg font-semibold drop-shadow">
                View your events in calendar format
              </p>
            </div>
            <button
              onClick={() => {
                setPrefilledDate(null)
                setShowCreateModal(true)
              }}
              className="bg-kellenberg-gold text-kellenberg-royal hover:bg-kellenberg-royal hover:text-white font-bold text-lg px-6 py-3 shadow-xl border-2 border-kellenberg-royal rounded-lg transition-all duration-300 inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </button>
          </div>
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
                  <button
                    key={`${weekIndex}-${dayIndex}`}
                    onClick={() => dayData && handleDateClick(dayData.date)}
                    disabled={!dayData}
                    className={`min-h-[120px] border rounded-lg p-2 text-left relative ${
                      dayData
                        ? isToday(dayData.date)
                          ? 'bg-kellenberg-gold/10 border-kellenberg-gold hover:bg-kellenberg-gold/20 cursor-pointer'
                          : 'bg-gray-50 border-gray-200 hover:border-kellenberg-royal/50 hover:bg-gray-100 cursor-pointer'
                        : 'bg-gray-100 border-gray-200 cursor-default'
                    } transition-colors`}
                  >
                    {dayData && (
                      <>
                        <div className={`absolute top-2 left-2 text-sm font-semibold ${
                          isToday(dayData.date) ? 'text-kellenberg-royal' : 'text-gray-700'
                        }`}>
                          {dayData.day}
                        </div>
                        <div className="pt-7 space-y-1">
                          {dayData.events.map(event => (
                            <button
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedEvent(event)
                              }}
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
                        </div>
                      </>
                    )}
                  </button>
                ))
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Event Details Modal */}
      {selectedEvent && !showEditModal && (
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
                <div>
                  <p className="font-medium text-gray-900">Capacity</p>
                  <p className="text-gray-700">{selectedEvent.capacity} students</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleEditClick}
                className="flex-1 bg-white text-kellenberg-royal border-2 border-kellenberg-royal hover:bg-kellenberg-royal hover:text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center justify-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDeleteClick}
                className="flex-1 bg-red-600 text-white hover:bg-red-700 font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
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

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => {
            setShowCreateModal(false)
            setPrefilledDate(null)
          }}
          onSuccess={handleEventCreated}
          moderatorId={userProfile?.id}
          prefilledDate={prefilledDate}
        />
      )}

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          onClose={() => {
            setShowEditModal(false)
            setSelectedEvent(null)
          }}
          onSuccess={handleEventUpdated}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && selectedEvent && (
        <ConfirmDialog
          title="Delete Event"
          message={`Are you sure you want to delete "${selectedEvent.title}"? This action cannot be undone.`}
          onConfirm={handleDeleteEvent}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={deleteLoading}
        />
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

