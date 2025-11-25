import { useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, X } from 'lucide-react'
import Button from './Button'
import { acceptAgreement } from '../utils/attendanceHelpers'

export default function StudentAgreementModal({ studentId, onAccepted }) {
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAccept = async () => {
    if (!agreed) {
      setError('Please check the box to confirm you have read and agree to the terms.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: acceptError } = await acceptAgreement(studentId)
      
      if (acceptError) {
        setError('Failed to accept agreement. Please try again.')
        console.error('Error accepting agreement:', acceptError)
      } else {
        onAccepted()
      }
    } catch (err) {
      setError('An unexpected error occurred.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-kellenberg-royal to-blue-700 text-white px-6 py-4 rounded-t-xl">
          <h2 className="text-2xl font-bold">S.A.L.T. Student Agreement</h2>
          <p className="text-kellenberg-gold text-sm mt-1">Please read carefully before continuing</p>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Welcome */}
          <div className="bg-blue-50 border-l-4 border-kellenberg-royal p-4 rounded">
            <h3 className="font-bold text-kellenberg-royal text-lg mb-2">Welcome to S.A.L.T.</h3>
            <p className="text-gray-700">
              Service, Allegiance, Leadership, Teamwork - S.A.L.T. is Kellenberg Memorial High School's 
              service organization dedicated to helping our school community by staffing various school 
              events throughout the year.
            </p>
          </div>

          {/* Membership */}
          <div>
            <h3 className="font-bold text-kellenberg-royal text-lg mb-2">Membership</h3>
            <p className="text-gray-700 mb-2">
              S.A.L.T. membership is open to all students in grades 9-12. By joining S.A.L.T., you commit 
              to embodying the values of service, allegiance, leadership, and teamwork.
            </p>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="font-bold text-kellenberg-royal text-lg mb-2">Annual Requirements</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Complete a minimum of <strong>20 service hours</strong> during the school year</li>
              <li>Use your <strong>@kellenberg.org email</strong> to register and communicate</li>
              <li>Create a new S.A.L.T. account each year</li>
            </ul>
          </div>

          {/* How It Works */}
          <div>
            <h3 className="font-bold text-kellenberg-royal text-lg mb-2">How S.A.L.T. Works</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                <strong>Browse Events:</strong> View upcoming events posted by S.A.L.T. moderators and volunteer 
                for events you are available to attend.
              </li>
              <li>
                <strong>Selection:</strong> Moderators review volunteers and select students for each event. 
                Being selected is not automatic - it depends on event needs.
              </li>
              <li>
                <strong>Confirmation:</strong> If selected, you will receive an email confirmation with 
                event details, dress code, roles, and check-in instructions.
              </li>
              <li>
                <strong>Attendance:</strong> On event day, arrive on time, check in with the moderator, 
                and complete your assigned responsibilities.
              </li>
              <li>
                <strong>Credit:</strong> After the event, your hours will be recorded and added to your total.
              </li>
            </ol>
          </div>

          {/* Policies */}
          <div>
            <h3 className="font-bold text-kellenberg-royal text-lg mb-2">Important Policies</h3>
            <div className="space-y-3">
              <div className="bg-yellow-50 border-l-4 border-kellenberg-gold p-3 rounded">
                <p className="font-semibold text-gray-900">Volunteering</p>
                <p className="text-gray-700 text-sm mt-1">
                  Only volunteer for events you can actually attend. You may un-volunteer before being 
                  selected, but once selected, you cannot un-volunteer through the site.
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-kellenberg-gold p-3 rounded">
                <p className="font-semibold text-gray-900">No-Shows</p>
                <p className="text-gray-700 text-sm mt-1">
                  If you are absent from an event after being selected and approved, you will lose 
                  <strong> half of the event's hours</strong> from your total as a penalty.
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-kellenberg-gold p-3 rounded">
                <p className="font-semibold text-gray-900">Full Participation Required</p>
                <p className="text-gray-700 text-sm mt-1">
                  You must stay for the entire event to receive credit. If you need to leave early, 
                  inform the moderator at the start of the event.
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-kellenberg-gold p-3 rounded">
                <p className="font-semibold text-gray-900">School Policies Apply</p>
                <p className="text-gray-700 text-sm mt-1">
                  All school policies apply during S.A.L.T. events, including dress code, behavior 
                  expectations, and phone usage policies.
                </p>
              </div>
            </div>
          </div>

          {/* Communication */}
          <div>
            <h3 className="font-bold text-kellenberg-royal text-lg mb-2">Communication</h3>
            <p className="text-gray-700">
              Students are expected to communicate directly with S.A.L.T. moderators about events, 
              scheduling, and any concerns. While parent involvement is welcome in special circumstances, 
              we encourage students to take ownership of their S.A.L.T. participation as part of their 
              leadership development.
            </p>
          </div>

          {/* Checking Agreement */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${
            agreed 
              ? 'bg-kellenberg-royal/10 border-kellenberg-royal' 
              : 'bg-gray-50 border-gray-300'
          }`}>
            <label className="flex items-start cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked)
                  setError('')
                }}
                className="mt-1 w-5 h-5 text-kellenberg-royal border-gray-300 rounded focus:ring-kellenberg-royal"
              />
              <span className="ml-3 text-gray-900">
                <strong>I have read and agree to the S.A.L.T. Student Agreement.</strong>
                <span className="block text-sm text-gray-600 mt-1">
                  I understand the requirements, policies, and expectations for S.A.L.T. membership.
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end">
          <button
            onClick={handleAccept}
            disabled={!agreed || loading}
            className={`px-8 py-3 rounded-lg font-bold inline-flex items-center transition-all duration-300 ${
              agreed && !loading
                ? 'bg-kellenberg-royal hover:bg-kellenberg-royal/90 text-white cursor-pointer'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                I Agree - Continue to S.A.L.T.
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

