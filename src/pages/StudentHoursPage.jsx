import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useStudentEventSignups } from '../hooks/useEvents'
import Layout from '../components/Layout'
import { ArrowLeft, Award, Calendar, Clock, TrendingUp, CheckCircle, XCircle } from 'lucide-react'
import { formatDate, formatHours, formatTimeRange } from '../utils/formatters'
import Button from '../components/Button'

export default function StudentHoursPage() {
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const { signups, loading } = useStudentEventSignups(userProfile?.id)

  // Filter and categorize signups
  const attendedEvents = signups.filter(s => s.attended === true && s.events)
  const noShowEvents = signups.filter(s => s.status === 'No-Show' && s.events)
  
  const totalHours = userProfile?.total_hours || 0
  const hoursGoal = 20
  const hoursProgress = Math.min((totalHours / hoursGoal) * 100, 100)

  // Calculate hours from events
  const earnedHours = attendedEvents.reduce((sum, signup) => 
    sum + (signup.events?.hours || 0), 0
  )
  const deductedHours = noShowEvents.reduce((sum, signup) => 
    sum + ((signup.events?.hours || 0) / 2), 0
  )

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/student')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Button>
        </div>

        {/* Title Section */}
        <div className="bg-gradient-to-r from-kellenberg-gold via-yellow-600 to-white rounded-xl shadow-2xl p-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">
                Service Hours Breakdown
              </h1>
              <p className="text-kellenberg-royal text-lg font-semibold drop-shadow">
                Track your progress toward the 20-hour goal
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl border-2 border-white/30">
              <div className="text-center">
                <Award className="w-12 h-12 text-white mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Total Hours</p>
                <p className="text-5xl font-bold text-white drop-shadow-lg">{totalHours.toFixed(1)}</p>
                <p className="text-white/90 text-sm mt-1">of {hoursGoal} required</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-xl shadow-2xl p-6 border-2 border-kellenberg-gold/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-kellenberg-royal">Overall Progress</h2>
            <span className={`text-2xl font-bold ${
              totalHours >= hoursGoal ? 'text-green-600' : 
              totalHours >= hoursGoal * 0.5 ? 'text-kellenberg-gold' : 'text-red-600'
            }`}>
              {hoursProgress.toFixed(0)}%
            </span>
          </div>
          
          <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                totalHours >= hoursGoal ? 'bg-green-500' : 
                totalHours >= hoursGoal * 0.5 ? 'bg-kellenberg-gold' : 'bg-red-500'
              }`}
              style={{ width: `${hoursProgress}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-3 text-sm text-gray-600">
            <span>0 hours</span>
            <span className="font-semibold">
              {totalHours >= hoursGoal ? (
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Goal Complete!
                </span>
              ) : (
                <span>{(hoursGoal - totalHours).toFixed(1)} hours remaining</span>
              )}
            </span>
            <span>20 hours</span>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Hours Earned</p>
                <p className="text-3xl font-bold text-green-600">+{earnedHours.toFixed(1)}</p>
                <p className="text-xs text-gray-600 mt-1">{attendedEvents.length} events attended</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Hours Deducted</p>
                <p className="text-3xl font-bold text-red-600">-{deductedHours.toFixed(1)}</p>
                <p className="text-xs text-gray-600 mt-1">{noShowEvents.length} no-shows</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-kellenberg-gold">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Net Total</p>
                <p className="text-3xl font-bold text-kellenberg-gold">{totalHours.toFixed(1)}</p>
                <p className="text-xs text-gray-600 mt-1">Current balance</p>
              </div>
              <div className="bg-kellenberg-gold/10 p-3 rounded-full">
                <Award className="w-8 h-8 text-kellenberg-gold" />
              </div>
            </div>
          </div>
        </div>

        {/* Events Attended */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kellenberg-royal mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading event history...</p>
          </div>
        ) : (
          <>
            {/* Attended Events */}
            {attendedEvents.length > 0 && (
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-green-500/20">
                <div className="px-6 py-5 bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
                  <h2 className="text-2xl font-bold text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    Events Attended ({attendedEvents.length})
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {attendedEvents.map((signup) => (
                    <div key={signup.id} className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">{signup.events.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{signup.events.description}</p>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(signup.events.start_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTimeRange(signup.events.start_date, signup.events.end_date)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Signed up: {formatDate(signup.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
                            +{formatHours(signup.events.hours)}
                          </div>
                          <p className="text-xs text-green-700 font-medium mt-1">Earned</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No-Show Events */}
            {noShowEvents.length > 0 && (
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-red-500/20">
                <div className="px-6 py-5 bg-gradient-to-r from-red-50 to-red-100 border-b-2 border-red-200">
                  <h2 className="text-2xl font-bold text-red-700 flex items-center gap-2">
                    <XCircle className="w-6 h-6" />
                    No-Shows ({noShowEvents.length})
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {noShowEvents.map((signup) => (
                    <div key={signup.id} className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">{signup.events.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{signup.events.description}</p>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(signup.events.start_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTimeRange(signup.events.start_date, signup.events.end_date)}
                            </span>
                          </div>
                          <p className="text-xs text-red-600 font-medium mt-2">
                            Penalty: Half of event hours deducted
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                            -{formatHours((signup.events.hours || 0) / 2)}
                          </div>
                          <p className="text-xs text-red-700 font-medium mt-1">Deducted</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Events */}
            {attendedEvents.length === 0 && noShowEvents.length === 0 && (
              <div className="bg-white rounded-xl shadow-2xl p-12 text-center border-2 border-gray-200">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Event History Yet</h3>
                <p className="text-gray-600 mb-4">
                  Start volunteering for events to earn service hours!
                </p>
                <Button onClick={() => navigate('/student')}>
                  Browse Available Events
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

