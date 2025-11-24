import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { updateEvent } from '../utils/eventHelpers'
import Button from './Button'
import Input from './Input'

export default function EditEventModal({ event, onClose, onSuccess }) {
  // Format date for datetime-local input (needs to be in local timezone)
  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const [formData, setFormData] = useState({
    title: event.title || '',
    description: event.description || '',
    location: event.location || '',
    start_date: formatDateForInput(event.start_date || event.date),
    end_date: formatDateForInput(event.end_date),
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
        start_date: formData.start_date,
        end_date: formData.end_date,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
      }

      const { error: updateError } = await updateEvent(event.id, eventData)

      if (updateError) {
        setError('Failed to update event: ' + updateError.message)
      } else {
        onSuccess()
      }
    } catch (err) {
      setError('Failed to update event')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto" 
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-kellenberg-royal focus:border-transparent"
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
            label="Start Date & Time"
            name="start_date"
            type="datetime-local"
            required
            value={formData.start_date}
            onChange={handleChange}
          />

          <Input
            label="End Date & Time"
            name="end_date"
            type="datetime-local"
            required
            value={formData.end_date}
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
    </div>,
    document.body
  )
}

