import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'
import Card, { CardBody } from '../components/Card'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-kellenberg-maroon to-red-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-kellenberg-gold rounded-full mb-4">
            <span className="text-4xl font-bold text-kellenberg-maroon">S</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">SALT</h2>
          <p className="text-kellenberg-gold font-medium">
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
                <Link to="/signup" className="text-kellenberg-maroon font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>

        <p className="text-center text-white/60 text-xs">
          For students and moderators only
        </p>
      </div>
    </div>
  )
}

