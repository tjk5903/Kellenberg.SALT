import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Download, Check, XCircle } from 'lucide-react'
import { useEventSignups } from '../hooks/useEvents'
import { updateSignupStatus } from '../utils/eventHelpers'
import { getStatusColor, getStatusIcon } from '../utils/formatters'
import Button from './Button'

export default function ViewSignupsModal({ event, onClose, onUpdate }) {
  const { signups, loading, error, refetch } = useEventSignups(event.id)
  const [updatingStatus, setUpdatingStatus] = useState({})
  const [statusFilter, setStatusFilter] = useState('All') // 'All', 'Pending', 'Approved'

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
    const headers = ['First Name', 'Last Name', 'Email', 'Grade', 'Homeroom', 'Registration Year', 'Status', 'Signup Date']
    const rows = signups.map(signup => [
      signup.students?.first_name || 'N/A',
      signup.students?.last_name || 'N/A',
      signup.students?.email || 'N/A',
      signup.students?.grade || 'N/A',
      signup.students?.homeroom || 'N/A',
      signup.students?.registration_year || 'N/A',
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
    All: signups.length,
    Pending: signups.filter(s => s.status === 'Pending').length,
    Approved: signups.filter(s => s.status === 'Approved').length,
    'Not Needed': signups.filter(s => s.status === 'Not Needed').length,
  }

  // Filter signups based on selected status
  const filteredSignups = statusFilter === 'All' 
    ? signups 
    : signups.filter(s => s.status === statusFilter)

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto" 
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center rounded-t-xl bg-white">
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

        {/* Status Filters */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                statusFilter === 'All'
                  ? 'bg-kellenberg-royal text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All ({statusCounts.All})
            </button>
            <button
              onClick={() => setStatusFilter('Pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                statusFilter === 'Pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white text-yellow-700 hover:bg-yellow-50'
              }`}
            >
              Pending ({statusCounts.Pending})
            </button>
            <button
              onClick={() => setStatusFilter('Approved')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                statusFilter === 'Approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-green-700 hover:bg-green-50'
              }`}
            >
              Approved ({statusCounts.Approved})
            </button>
          </div>
        </div>

        {/* Signups List */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: '60vh' }}>
          {error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p className="font-semibold mb-2">Error loading signups</p>
                <p className="text-sm">{error}</p>
                <button 
                  onClick={refetch}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kellenberg-royal mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading signups...</p>
            </div>
          ) : filteredSignups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {signups.length === 0 
                  ? 'No signups yet for this event.' 
                  : `No ${statusFilter.toLowerCase()} signups.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSignups.map(signup => {
                // Defensive check for student data
                if (!signup.students) {
                  console.error('Missing student data for signup:', signup.id)
                  return null
                }
                
                return (
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
                          {signup.students.homeroom && <span>Homeroom {signup.students.homeroom}</span>}
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
              )})}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

