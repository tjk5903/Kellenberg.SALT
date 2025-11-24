import { format, parseISO, isPast, isFuture } from 'date-fns'

export const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = parseISO(dateString)
    return format(date, 'MMMM d, yyyy')
  } catch (error) {
    return dateString
  }
}

export const formatDateTime = (dateString) => {
  if (!dateString) return ''
  try {
    const date = parseISO(dateString)
    return format(date, 'MMM d, yyyy h:mm a')
  } catch (error) {
    return dateString
  }
}

export const formatTime = (dateString) => {
  if (!dateString) return ''
  try {
    const date = parseISO(dateString)
    return format(date, 'h:mm a')
  } catch (error) {
    return dateString
  }
}

export const isEventPast = (dateString) => {
  if (!dateString) return false
  try {
    return isPast(parseISO(dateString))
  } catch (error) {
    return false
  }
}

export const isEventUpcoming = (dateString) => {
  if (!dateString) return false
  try {
    return isFuture(parseISO(dateString))
  } catch (error) {
    return false
  }
}

export const getStatusColor = (status) => {
  switch (status) {
    case 'Approved':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'Not Needed':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const getStatusIcon = (status) => {
  switch (status) {
    case 'Approved':
      return '✓'
    case 'Pending':
      return '⏳'
    case 'Not Needed':
      return '—'
    default:
      return '?'
  }
}

