import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'
import Card, { CardBody } from '../components/Card'
import { validateEmail, getEmailErrorMessage } from '../config/validation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const { signIn, resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validate Kellenberg email
    if (!validateEmail(email)) {
      setError(getEmailErrorMessage())
      return
    }
    
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        setError(error.message)
      } else {
        // Navigation will be handled by AuthContext after profile is fetched
        setTimeout(() => {
          navigate('/')
        }, 500)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setResetMessage('')
    setError('')
    
    // Validate Kellenberg email
    if (!validateEmail(resetEmail)) {
      setError(getEmailErrorMessage())
      return
    }
    
    setLoading(true)

    try {
      const { error } = await resetPassword(resetEmail)
      
      if (error) {
        setError(error.message)
      } else {
        setResetMessage('Password reset email sent! Check your inbox.')
        setTimeout(() => {
          setShowForgotPassword(false)
          setResetEmail('')
          setResetMessage('')
        }, 3000)
      }
    } catch (err) {
      setError('Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kellenberg-royal to-blue-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <h2 className="text-5xl font-bold text-white mb-3">S.A.L.T.</h2>
          <p className="text-kellenberg-gold font-medium text-lg">
            Service • Allegiance • Leadership • Teamwork
          </p>
          <p className="text-white/80 mt-2">Kellenberg Memorial High School</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardBody className="p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Sign In
            </h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {!showForgotPassword ? (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@kellenberg.org"
                    autoComplete="email"
                  />

                  <Input
                    label="Password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-kellenberg-royal hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    disabled={loading}
                  >
                    Sign In
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-kellenberg-royal font-medium hover:underline">
                      Sign up
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>

                  {resetMessage && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                      {resetMessage}
                    </div>
                  )}

                  <Input
                    label="Email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@kellenberg.org"
                    autoComplete="email"
                  />

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowForgotPassword(false)
                        setResetEmail('')
                        setError('')
                        setResetMessage('')
                      }}
                      fullWidth
                    >
                      Back to Login
                    </Button>
                    <Button
                      type="submit"
                      fullWidth
                      loading={loading}
                      disabled={loading}
                    >
                      Send Reset Link
                    </Button>
                  </div>
                </form>
              </>
            )}
          </CardBody>
        </Card>

        <p className="text-center text-white/60 text-xs">
          For students and moderators only
        </p>
      </div>
    </div>
  )
}

