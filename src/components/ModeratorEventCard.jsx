import { useState } from 'react'
import { Calendar, MapPin, Users, Clock, Edit, Trash2, Eye } from 'lucide-react'
import { formatDate, formatTime } from '../utils/formatters'
import { deleteEvent } from '../utils/eventHelpers'
import Button from './Button'
import Card, { CardBody, CardFooter } from './Card'
import EditEventModal from './EditEventModal'
import ViewSignupsModal from './ViewSignupsModal'

export default function ModeratorEventCard({ event, onUpdate, isPast = false }) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSignupsModal, setShowSignupsModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      const { error } = await deleteEvent(event.id)
      if (error) {
        alert('Failed to delete event: ' + error.message)
      } else {
        onUpdate()
      }
    } catch (err) {
      alert('Failed to delete event')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSuccess = () => {
    setShowEditModal(false)
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
                  <Calendar className="w-4 h-4 mr-2 text-kellenberg-maroon" />
                  <span>{formatDate(event.date)}</span>
                  {event.date && (
                    <>
                      <Clock className="w-4 h-4 ml-3 mr-2 text-kellenberg-maroon" />
                      <span>{formatTime(event.date)}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center text-gray-700 text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-kellenberg-maroon" />
                  <span>{event.location}</span>
                </div>

                {event.capacity && (
                  <div className="flex items-center text-gray-700 text-sm">
                    <Users className="w-4 h-4 mr-2 text-kellenberg-maroon" />
                    <span>Capacity: {event.capacity} students</span>
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
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
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
    </>
  )
}

