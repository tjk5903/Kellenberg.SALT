import { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Clock, Edit, Trash2, Eye, Award, Shirt } from 'lucide-react'
import { formatDate, formatTimeRange, formatHours } from '../utils/formatters'
import { getEventSignupCount } from '../utils/eventHelpers'
import { deleteEvent } from '../utils/eventHelpers'
import Button from './Button'
import Card, { CardBody, CardFooter } from './Card'
import EditEventModal from './EditEventModal'
import ViewSignupsModal from './ViewSignupsModal'
import ConfirmDialog from './ConfirmDialog'
import Toast from './Toast'

export default function ModeratorEventCard({ event, onUpdate, isPast = false }) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSignupsModal, setShowSignupsModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [signupCount, setSignupCount] = useState(0)

  useEffect(() => {
    fetchSignupCount()
  }, [event.id])

  const fetchSignupCount = async () => {
    const { count } = await getEventSignupCount(event.id)
    setSignupCount(count || 0)
  }

  const handleDelete = async () => {
    setShowDeleteConfirm(false)
    setLoading(true)
    
    try {
      const { error } = await deleteEvent(event.id)
      if (error) {
        setToast({ type: 'error', message: 'Failed to delete event: ' + error.message })
      } else {
        setToast({ type: 'success', message: 'Event deleted successfully!' })
        setTimeout(() => onUpdate(), 500)
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete event' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSuccess = () => {
    setShowEditModal(false)
    setToast({ type: 'success', message: 'Event updated successfully!' })
    onUpdate()
  }

  return (
    <>
      <Card hover>
        <CardBody>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h3>
                <p className="text-gray-600 text-sm">{event.description}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-gray-700 text-sm">
                <Calendar className="w-4 h-4 mr-2 text-kellenberg-royal" />
                <span>{formatDate(event.start_date || event.date)}</span>
                {(event.start_date || event.date) && event.end_date && (
                  <>
                    <Clock className="w-4 h-4 ml-3 mr-2 text-kellenberg-royal" />
                    <span>{formatTimeRange(event.start_date || event.date, event.end_date)}</span>
                  </>
                  )}
                </div>

                <div className="flex items-center text-gray-700 text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-kellenberg-royal" />
                  <span>{event.location}</span>
                </div>

                {(event.students_needed || event.capacity) && (
                  <div className="flex items-center text-gray-700 text-sm">
                    <Users className="w-4 h-4 mr-2 text-kellenberg-royal" />
                    <span>
                      {signupCount} signed up
                      {event.students_needed && ` / ${event.students_needed} needed`}
                      {event.capacity && ` (max: ${event.capacity})`}
                    </span>
                  </div>
                )}

                {event.hours && (
                  <div className="flex items-center text-gray-700 text-sm">
                    <Award className="w-4 h-4 mr-2 text-kellenberg-gold" />
                    <span className="font-medium text-kellenberg-gold">{formatHours(event.hours)}</span>
                  </div>
                )}

                {event.dress_code && (
                  <div className="flex items-center text-gray-700 text-sm">
                    <Shirt className="w-4 h-4 mr-2 text-kellenberg-royal" />
                    <span>{event.dress_code}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>

        <CardFooter>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSignupsModal(true)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View Signups
            </Button>
            
            {!isPast && (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="bg-white text-kellenberg-royal border-2 border-kellenberg-royal hover:bg-kellenberg-royal hover:text-white font-medium px-3 py-1.5 text-sm rounded-lg transition-all duration-300 inline-flex items-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  loading={loading}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Edit Modal */}
      {showEditModal && (
        <EditEventModal
          event={event}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* View Signups Modal */}
      {showSignupsModal && (
        <ViewSignupsModal
          event={event}
          onClose={() => setShowSignupsModal(false)}
          onUpdate={onUpdate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Event?"
          message={`Are you sure you want to delete "${event.title}"? This action cannot be undone and will remove all student signups.`}
          confirmText="Delete Event"
          cancelText="Cancel"
          type="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
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
    </>
  )
}

