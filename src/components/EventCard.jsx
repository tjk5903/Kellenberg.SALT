import { useState } from 'react'
import { Calendar, MapPin, Clock, Award, Shirt } from 'lucide-react'
import { formatDate, formatTimeRange, formatHours, isEventPast, getStatusColor } from '../utils/formatters'
import { signUpForEvent, checkExistingSignup, getEventSignupCount } from '../utils/eventHelpers'
import Button from './Button'
import Card, { CardBody, CardFooter } from './Card'
import { useEffect } from 'react'

export default function EventCard({ event, studentId, onSignupSuccess }) {
  const [loading, setLoading] = useState(false)
  const [signupCount, setSignupCount] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSignupCount()
  }, [event.id])

  const fetchSignupCount = async () => {
    const { count } = await getEventSignupCount(event.id)
    setSignupCount(count || 0)
  }

  const handleSignup = async () => {
    setError('')
    setLoading(true)

    try {
      // Check if already signed up
      const { data: existingSignup } = await checkExistingSignup(studentId, event.id)
      
      if (existingSignup) {
        setError('You have already signed up for this event')
        setLoading(false)
        return
      }

      // Check capacity
      if (event.capacity && signupCount >= event.capacity) {
        setError('This event is at full capacity')
        setLoading(false)
        return
      }

      // Sign up for event
      const { error: signupError } = await signUpForEvent(studentId, event.id)
      
      if (signupError) {
        setError(signupError.message)
      } else {
        onSignupSuccess && onSignupSuccess()
      }
    } catch (err) {
      setError('Failed to sign up for event')
    } finally {
      setLoading(false)
    }
  }

  const isPast = isEventPast(event.start_date || event.date)
  const isFull = event.capacity && signupCount >= event.capacity

  return (
    <Card hover>
      <CardBody>
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
          </div>

          <div className="space-y-2">
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

            {event.roles && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm">
                <p className="font-semibold text-kellenberg-royal mb-1">Roles:</p>
                <p className="text-gray-700">{event.roles}</p>
              </div>
            )}

            {event.check_in_instructions && (
              <div className="mt-2 p-2 bg-kellenberg-gold/10 rounded-lg text-sm">
                <p className="font-semibold text-kellenberg-royal mb-1">Check-In:</p>
                <p className="text-gray-700">{event.check_in_instructions}</p>
              </div>
            )}

            {event.moderators && (
              <p className="text-xs text-gray-500">
                Organized by {event.moderators.first_name} {event.moderators.last_name}
              </p>
            )}
          </div>
        </div>
      </CardBody>

      <CardFooter>
        {error && (
          <p className="text-red-600 text-sm mb-2">{error}</p>
        )}
        <Button
          onClick={handleSignup}
          loading={loading}
          disabled={loading || isPast || isFull}
          fullWidth
        >
          {isPast ? 'Event Passed' : isFull ? 'Event Full' : 'Sign Up'}
        </Button>
      </CardFooter>
    </Card>
  )
}

