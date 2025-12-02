import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'
import Card, { CardBody } from '../components/Card'
import { validateEmail, getEmailErrorMessage } from '../config/validation'

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: '',
    homeroom: '',
    userType: 'student', // 'student' or 'moderator'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!/\d/.test(formData.password)) {
      setError('Password must contain at least one number')
      return
    }

    if (!validateEmail(formData.email)) {
      setError(getEmailErrorMessage())
      return
    }

    if (formData.userType === 'student' && !formData.grade) {
      setError('Grade is required for students')
      return
    }

    if (formData.userType === 'student' && !formData.homeroom) {
      setError('Homeroom is required for students')
      return
    }

    setLoading(true)

    try {
      // Calculate registration year for students (graduation year)
      const currentYear = new Date().getFullYear()
      const registrationYear = formData.userType === 'student' 
        ? currentYear + (13 - parseInt(formData.grade))
        : null

      const { error } = await signUp(
        formData.email,
        formData.password,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          grade: formData.userType === 'student' ? formData.grade : null,
          homeroom: formData.userType === 'student' ? formData.homeroom : null,
          registration_year: registrationYear,
          user_type: formData.userType,
        }
      )

      if (error) {
        setError(error.message)
      } else {
        // Show success message
        alert('Account created! Please check your email for verification. You can now sign in.')
        navigate('/login')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kellenberg-royal to-blue-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <h2 className="text-5xl font-bold text-white mb-3">S.A.L.T.</h2>
          <p className="text-kellenberg-gold font-medium text-lg">
            Service • Allegiance • Leadership • Teamwork
          </p>
          <p className="text-white/80 mt-2 mb-4">Create Your Account</p>
        </div>

        {/* Signup Form */}
        <Card>
          <CardBody className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am a <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'student' })}
                    className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                      formData.userType === 'student'
                        ? 'border-kellenberg-royal bg-kellenberg-royal text-white'
                        : 'border-gray-300 text-gray-700 hover:border-kellenberg-royal'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'moderator' })}
                    className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                      formData.userType === 'moderator'
                        ? 'border-kellenberg-royal bg-kellenberg-royal text-white'
                        : 'border-gray-300 text-gray-700 hover:border-kellenberg-royal'
                    }`}
                  >
                    Moderator
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                />
              </div>

              <Input
                label="Email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@kellenberg.org"
                autoComplete="email"
              />

              {formData.userType === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="grade"
                      required
                      value={formData.grade}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-kellenberg-royal focus:border-transparent"
                    >
                      <option value="">Select grade</option>
                      <option value="6">6th Grade</option>
                      <option value="7">7th Grade</option>
                      <option value="8">8th Grade</option>
                      <option value="9">9th Grade</option>
                      <option value="10">10th Grade</option>
                      <option value="11">11th Grade</option>
                      <option value="12">12th Grade</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Homeroom <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="homeroom"
                      required
                      value={formData.homeroom}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-kellenberg-royal focus:border-transparent"
                    >
                      <option value="">Select homeroom</option>
                      {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'].map(letter => (
                        <option key={letter} value={letter}>{letter}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <Input
                label="Password"
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters with a number"
                autoComplete="new-password"
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                autoComplete="new-password"
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-kellenberg-royal font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

