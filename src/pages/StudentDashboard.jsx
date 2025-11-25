import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEvents, useStudentEventSignups } from '../hooks/useEvents'
import Layout from '../components/Layout'
import EventCard from '../components/EventCard'
import StudentSignupCard from '../components/StudentSignupCard'
import StudentAgreementModal from '../components/StudentAgreementModal'
import { Calendar, Clock, Check, CalendarDays, Award, TrendingUp } from 'lucide-react'
import { formatHours } from '../utils/formatters'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { userProfile, needsAgreement, setNeedsAgreement, refreshProfile } = useAuth()
  const { events, loading: eventsLoading, refetch: refetchEvents } = useEvents()
  const { signups, loading: signupsLoading, refetch: refetchSignups } = useStudentEventSignups(userProfile?.id)
  const [activeTab, setActiveTab] = useState('available') // 'available' or 'my-events'

  const handleAgreementAccepted = () => {
    setNeedsAgreement(false)
    refreshProfile()
  }

  const totalHours = userProfile?.total_hours || 0
  const hoursGoal = 20
  const hoursProgress = Math.min((totalHours / hoursGoal) * 100, 100)
  const hoursColor = totalHours >= hoursGoal ? 'text-green-600' : totalHours >= hoursGoal * 0.5 ? 'text-kellenberg-gold' : 'text-red-600'
  const progressBarColor = totalHours >= hoursGoal ? 'bg-green-500' : totalHours >= hoursGoal * 0.5 ? 'bg-kellenberg-gold' : 'bg-red-500'

  const handleSignupSuccess = () => {
    refetchEvents()
    refetchSignups()
  }

  // Filter events that student hasn't signed up for yet and are not past events
  const availableEvents = events.filter(event => {
    const isSignedUp = signups.some(signup => signup.event_id === event.id)
    const isPastEvent = new Date(event.start_date || event.date) < new Date()
    return !isSignedUp && !isPastEvent
  })

  return (
    <>
      {needsAgreement && userProfile?.id && (
        <StudentAgreementModal 
          studentId={userProfile.id}
          onAccepted={handleAgreementAccepted}
        />
      )}
      <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-kellenberg-royal via-blue-700 to-white rounded-xl shadow-2xl p-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">
                Welcome, {userProfile?.first_name}!
              </h1>
              <p className="text-kellenberg-gold text-lg font-semibold drop-shadow">
                Explore service events and track your participation
              </p>
            </div>
            <button
              onClick={() => navigate('/student/calendar')}
              className="bg-white text-kellenberg-royal hover:bg-kellenberg-royal hover:text-white font-bold text-lg px-6 py-3 shadow-xl border-2 border-kellenberg-royal rounded-lg transition-all duration-300 inline-flex items-center justify-center"
            >
              <CalendarDays className="w-5 h-5 mr-2" />
              Calendar View
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Hours Progress Card */}
          <div 
            onClick={() => navigate('/student/hours')}
            className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-kellenberg-gold hover:shadow-2xl transition-all cursor-pointer hover:scale-105 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Service Hours</p>
                <p className={`text-4xl font-bold ${hoursColor}`}>
                  {totalHours.toFixed(1)}
                </p>
                <p className="text-xs text-gray-600 font-medium mt-1">of {hoursGoal} required</p>
                <p className="text-xs text-kellenberg-gold font-semibold mt-1 group-hover:underline">
                  Click to view breakdown →
                </p>
              </div>
              <div className="bg-kellenberg-gold/10 p-3 rounded-full">
                <Award className="w-10 h-10 text-kellenberg-gold" />
              </div>
            </div>
            {/* Progress Bar */}
            <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`${progressBarColor} h-full rounded-full transition-all duration-500`}
                style={{ width: `${hoursProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>0</span>
              <span className="font-semibold">{hoursProgress.toFixed(0)}%</span>
              <span>{hoursGoal}</span>
            </div>
            {totalHours >= hoursGoal && (
              <div className="mt-3 flex items-center justify-center text-green-600 text-sm font-semibold">
                <TrendingUp className="w-4 h-4 mr-1" />
                Goal Complete!
              </div>
            )}
          </div>

          <div 
            onClick={() => navigate('/student/all-signups')}
            className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-kellenberg-royal hover:shadow-2xl transition-all cursor-pointer hover:scale-105 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Signups</p>
                <p className="text-4xl font-bold text-kellenberg-royal">{signups.length}</p>
                <p className="text-xs text-kellenberg-royal font-semibold mt-1 group-hover:underline">
                  Click to view all →
                </p>
              </div>
              <div className="bg-kellenberg-royal/10 p-3 rounded-full">
                <Calendar className="w-10 h-10 text-kellenberg-royal" />
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/student/approved-signups')}
            className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-green-500 hover:shadow-2xl transition-all cursor-pointer hover:scale-105 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Approved</p>
                <p className="text-4xl font-bold text-green-600">
                  {signups.filter(s => s.status === 'Approved').length}
                </p>
                <p className="text-xs text-green-600 font-semibold mt-1 group-hover:underline">
                  Click to view all →
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="w-10 h-10 text-green-600" />
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/student/pending-signups')}
            className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-kellenberg-gold hover:shadow-2xl transition-all cursor-pointer hover:scale-105 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Pending</p>
                <p className="text-4xl font-bold text-kellenberg-gold">
                  {signups.filter(s => s.status === 'Pending').length}
                </p>
                <p className="text-xs text-kellenberg-gold font-semibold mt-1 group-hover:underline">
                  Click to view all →
                </p>
              </div>
              <div className="bg-kellenberg-gold/10 p-3 rounded-full">
                <Clock className="w-10 h-10 text-kellenberg-gold" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-kellenberg-gold/20">
          <div className="border-b-2 border-kellenberg-gold/30">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('available')}
                className={`px-6 py-4 text-sm font-bold border-b-4 transition-all ${
                  activeTab === 'available'
                    ? 'border-kellenberg-royal text-kellenberg-royal bg-kellenberg-royal/5'
                    : 'border-transparent text-gray-600 hover:text-kellenberg-royal hover:border-kellenberg-gold/50 hover:bg-gray-50'
                }`}
              >
                Available Events ({availableEvents.length})
              </button>
              <button
                onClick={() => setActiveTab('my-events')}
                className={`px-6 py-4 text-sm font-bold border-b-4 transition-all ${
                  activeTab === 'my-events'
                    ? 'border-kellenberg-royal text-kellenberg-royal bg-kellenberg-royal/5'
                    : 'border-transparent text-gray-600 hover:text-kellenberg-royal hover:border-kellenberg-gold/50 hover:bg-gray-50'
                }`}
              >
                My Events ({signups.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Available Events Tab */}
            {activeTab === 'available' && (
              <div>
                {eventsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kellenberg-royal mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading events...</p>
                  </div>
                ) : availableEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events available</h3>
                    <p className="text-gray-600">Check back later for new service opportunities!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {availableEvents.map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        studentId={userProfile?.id}
                        onSignupSuccess={handleSignupSuccess}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Events Tab */}
            {activeTab === 'my-events' && (
              <div>
                {signupsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kellenberg-royal mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your events...</p>
                  </div>
                ) : signups.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No signups yet</h3>
                    <p className="text-gray-600">Sign up for events to see them here!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {signups.map(signup => (
                      <StudentSignupCard 
                        key={signup.id} 
                        signup={signup}
                        onCancelSuccess={handleSignupSuccess}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
    </>
  )
}

