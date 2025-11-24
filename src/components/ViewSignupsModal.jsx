import { useState } from 'react'
import { X, Download, Check, XCircle } from 'lucide-react'
import { useEventSignups } from '../hooks/useEvents'
import { updateSignupStatus } from '../utils/eventHelpers'
import { getStatusColor, getStatusIcon } from '../utils/formatters'
import Button from './Button'

export default function ViewSignupsModal({ event, onClose, onUpdate }) {
  const { signups, loading, refetch } = useEventSignups(event.id)
  const [updatingStatus, setUpdatingStatus] = useState({})

  const handleStatusUpdate = async (signupId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [signupId]: true }))
    
    try {
      const { error } = await updateSignupStatus(signupId, newStatus)
      
      if (error) {
        alert('Failed to update status: ' + error.message)
      } else {
        refetch()
        onUpdate()
      }
    } catch (err) {
      alert('Failed to update status')
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [signupId]: false }))
    }
  }

  const handleExport = () => {
    // Create CSV content
    const headers = ['First Name', 'Last Name', 'Email', 'Grade', 'Registration Year', 'Status', 'Signup Date']
    const rows = signups.map(signup => [
      signup.students.first_name,
      signup.students.last_name,
      signup.students.email,
      signup.students.grade,
      signup.students.registration_year,
      signup.status,
      new Date(signup.created_at).toLocaleDateString()
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.title.replace(/\s+/g, '_')}_signups.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const statusCounts = {
    Pending: signups.filter(s => s.status === 'Pending').length,
    Approved: signups.filter(s => s.status === 'Approved').length,
    'Not Needed': signups.filter(s => s.status === 'Not Needed').length,
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {signups.length} total signup{signups.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {signups.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-1" />
                Export CSV
              </Button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-gray-600">Pending:</span>{' '}
              <span className="font-semibold text-yellow-600">{statusCounts.Pending}</span>
            </div>
            <div>
              <span className="text-gray-600">Approved:</span>{' '}
              <span className="font-semibold text-green-600">{statusCounts.Approved}</span>
            </div>
            <div>
              <span className="text-gray-600">Not Needed:</span>{' '}
              <span className="font-semibold text-gray-600">{statusCounts['Not Needed']}</span>
            </div>
          </div>
        </div>

        {/* Signups List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kellenberg-maroon mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading signups...</p>
            </div>
          ) : signups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No signups yet for this event.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {signups.map(signup => (
                <div
                  key={signup.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {signup.students.first_name} {signup.students.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{signup.students.email}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span>Grade {signup.students.grade}</span>
                        <span>Class of {signup.students.registration_year}</span>
                        <span>Signed up: {new Date(signup.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(signup.status)}`}>
                        {getStatusIcon(signup.status)} {signup.status}
                      </span>

                      {signup.status === 'Pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStatusUpdate(signup.id, 'Approved')}
                            disabled={updatingStatus[signup.id]}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(signup.id, 'Not Needed')}
                            disabled={updatingStatus[signup.id]}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Mark as Not Needed"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

