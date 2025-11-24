import { useState } from 'react'
import { X } from 'lucide-react'
import { updateEvent } from '../utils/eventHelpers'
import Button from './Button'
import Input from './Input'

export default function EditEventModal({ event, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: event.title || '',
    description: event.description || '',
    location: event.location || '',
    date: event.date ? event.date.slice(0, 16) : '', // Format for datetime-local
    capacity: event.capacity || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        date: formData.date,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
      }

      const { error: updateError } = await updateEvent(event.id, eventData)

      if (updateError) {
        setError(updateError.message)
      } else {
        onSuccess()
      }
    } catch (err) {
      setError('Failed to update event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            label="Event Title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Food Drive Volunteer"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-kellenberg-maroon focus:border-transparent"
              placeholder="Describe the event..."
            />
          </div>

          <Input
            label="Location"
            name="location"
            required
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., School Cafeteria"
          />

          <Input
            label="Date & Time"
            name="date"
            type="datetime-local"
            required
            value={formData.date}
            onChange={handleChange}
          />

          <Input
            label="Capacity (Optional)"
            name="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="Maximum number of students"
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              fullWidth
            >
              Update Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

