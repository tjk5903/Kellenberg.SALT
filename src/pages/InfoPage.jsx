import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import { ArrowLeft, Heart, Users, Award, Target, AlertCircle, Mail, Shield } from 'lucide-react'
import Button from '../components/Button'

export default function InfoPage() {
  const navigate = useNavigate()
  const { userRole } = useAuth()

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/${userRole}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Button>
        </div>

        {/* Title Section */}
        <div className="bg-gradient-to-r from-kellenberg-royal via-blue-700 to-white rounded-xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">
            About S.A.L.T
          </h1>
          <p className="text-kellenberg-gold text-lg font-semibold drop-shadow">
            Service • Allegiance • Leadership • Teamwork
          </p>
        </div>

        {/* Welcome Message */}
        <div className="bg-white rounded-xl shadow-xl p-6 border-2 border-kellenberg-royal/20">
          <h2 className="text-2xl font-bold text-kellenberg-royal mb-4">Welcome to S.A.L.T</h2>
          <p className="text-gray-700 leading-relaxed">
            Welcome to the S.A.L.T registration and volunteer management system. Kellenberg students 
            may use this site to register for S.A.L.T and log on to volunteer for events. You will 
            receive an email confirming whether or not you are needed for an event.
          </p>
        </div>

        {/* Important Reminders */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-xl p-6 border-l-4 border-yellow-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-500/20 p-3 rounded-full">
              <AlertCircle className="w-6 h-6 text-yellow-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Important Reminders</h3>
          </div>
          <ul className="space-y-3 text-gray-800">
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 mt-1 font-bold">•</span>
              <span>Only volunteer for events you will be able to help at.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 mt-1 font-bold">•</span>
              <span>You will receive an email confirmation letting you know whether or not your assistance is required at an event.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 mt-1 font-bold">•</span>
              <span className="font-semibold">All members of S.A.L.T must create a NEW account each school year.</span>
            </li>
          </ul>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mission */}
          <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-kellenberg-royal">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-kellenberg-royal/10 p-3 rounded-full">
                <Target className="w-6 h-6 text-kellenberg-royal" />
              </div>
              <h3 className="text-xl font-bold text-kellenberg-royal">Mission</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              S.A.L.T connects Kellenberg students with meaningful service opportunities, 
              fostering a spirit of community engagement and personal growth through 
              organized volunteer events.
            </p>
          </div>

          {/* Values */}
          <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-kellenberg-gold">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-kellenberg-gold/10 p-3 rounded-full">
                <Heart className="w-6 h-6 text-kellenberg-gold" />
              </div>
              <h3 className="text-xl font-bold text-kellenberg-royal">Our Values</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-kellenberg-gold mt-1">•</span>
                <span><strong>Service:</strong> Giving back to our community</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-kellenberg-gold mt-1">•</span>
                <span><strong>Allegiance:</strong> Commitment to our school</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-kellenberg-gold mt-1">•</span>
                <span><strong>Leadership:</strong> Developing future leaders</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-kellenberg-gold mt-1">•</span>
                <span><strong>Teamwork:</strong> Working together</span>
              </li>
            </ul>
          </div>

          {/* For Students */}
          <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-kellenberg-royal">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-kellenberg-royal/10 p-3 rounded-full">
                <Users className="w-6 h-6 text-kellenberg-royal" />
              </div>
              <h3 className="text-xl font-bold text-kellenberg-royal">For Students</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Browse upcoming service events, sign up with ease, and track your 
              participation. Build your service record and make a difference in 
              your community.
            </p>
          </div>

          {/* For Moderators */}
          <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-kellenberg-gold">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-kellenberg-gold/10 p-3 rounded-full">
                <Award className="w-6 h-6 text-kellenberg-gold" />
              </div>
              <h3 className="text-xl font-bold text-kellenberg-royal">For Moderators</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Create and manage service events, review student signups, approve 
              participation, and export attendance records. Streamline event 
              coordination with powerful tools.
            </p>
          </div>
        </div>

        {/* Student Responsibility Policy */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-kellenberg-royal/20">
          <div className="px-6 py-5 bg-gradient-to-r from-kellenberg-royal/5 to-kellenberg-gold/5 border-b-2 border-kellenberg-royal">
            <div className="flex items-center gap-3">
              <Shield className="w-7 h-7 text-kellenberg-royal" />
              <h2 className="text-2xl font-bold text-kellenberg-royal">
                Student Responsibility Policy
              </h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-kellenberg-royal/5 border-l-4 border-kellenberg-royal p-4 rounded-r-lg">
              <p className="text-gray-800 font-semibold mb-2">
                <Mail className="w-5 h-5 inline mr-2 text-kellenberg-royal" />
                Email Requirement
              </p>
              <p className="text-gray-700 leading-relaxed">
                Since S.A.L.T is a student club, students must use their <strong>@kellenberg.org email address</strong> for 
                all S.A.L.T-related communications and account registration.
              </p>
            </div>

            <div className="bg-kellenberg-gold/5 border-l-4 border-kellenberg-gold p-4 rounded-r-lg">
              <p className="text-gray-800 font-semibold mb-2">
                <Users className="w-5 h-5 inline mr-2 text-kellenberg-gold" />
                Direct Student Communication
              </p>
              <p className="text-gray-700 leading-relaxed mb-2">
                All communications with the S.A.L.T moderators should be limited to the students. 
                <strong> Parents should not call or email the school with questions pertaining to the club.</strong>
              </p>
              <p className="text-gray-700 leading-relaxed">
                Among other characteristics, S.A.L.T hopes to teach each member the importance of responsibility 
                for one's own actions, commitments, and responsibilities. As such, each student is responsible 
                for their involvement in the club, and any questions or concerns should be made by the student 
                directly to the moderators.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <p className="text-gray-800 font-semibold mb-2">
                <AlertCircle className="w-5 h-5 inline mr-2 text-blue-600" />
                Why This Policy?
              </p>
              <p className="text-gray-700 leading-relaxed">
                This policy hopes to alleviate the many phone calls and emails from parents to the school. 
                While we understand that parents often become concerned about their children's involvement in 
                school clubs, we expect each student to develop the ability to effectively communicate with 
                the club moderators.
              </p>
            </div>

            <div className="text-sm text-gray-600 italic p-4 bg-gray-50 rounded-lg">
              <strong>Note:</strong> We understand that there are rare extraordinary circumstances in which this 
              policy may be relaxed. This policy is also relaxed for those students in the Latin School.
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-kellenberg-gold/20">
          <div className="px-6 py-5 bg-gradient-to-r from-kellenberg-royal/5 to-kellenberg-gold/5 border-b-2 border-kellenberg-gold">
            <h2 className="text-2xl font-bold text-kellenberg-royal">
              Need Help?
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              If you have questions or need assistance with the S.A.L.T platform, 
              please contact the S.A.L.T coordinators or visit the main office.
            </p>
            <p className="text-sm text-gray-600">
              <strong>Kellenberg Memorial High School</strong><br />
              1400 Glenn Curtiss Boulevard<br />
              Uniondale, NY 11553
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

