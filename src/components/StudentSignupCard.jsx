import { useState } from 'react'
import { Calendar, MapPin, Clock, XCircle } from 'lucide-react'
import { formatDate, formatTime, isEventPast, getStatusColor, getStatusIcon } from '../utils/formatters'
import { cancelEventSignup } from '../utils/eventHelpers'
import Button from './Button'
import Card, { CardBody, CardFooter } from './Card'

export default function StudentSignupCard({ signup, onCancelSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const event = signup.events

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this signup?')) {
      return
    }

    setError('')
    setLoading(true)

    try {
      const { error: cancelError } = await cancelEventSignup(signup.id)
      
      if (cancelError) {
        setError(cancelError.message)
      } else {
        onCancelSuccess && onCancelSuccess()
      }
    } catch (err) {
      setError('Failed to cancel signup')
    } finally {
      setLoading(false)
    }
  }

  const isPast = isEventPast(event.date)
  const canCancel = !isPast && signup.status === 'Pending'

  return (
    <Card>
      <CardBody>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(signup.status)}`}>
                  {getStatusIcon(signup.status)} {signup.status}
                </span>
              </div>
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
            </div>
          </div>
        </div>
      </CardBody>

      {canCancel && (
        <CardFooter>
          {error && (
            <p className="text-red-600 text-sm mb-2">{error}</p>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={handleCancel}
            loading={loading}
            disabled={loading}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Cancel Signup
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

