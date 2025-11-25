import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [userRole, setUserRole] = useState(null) // 'student' or 'moderator'
  const [loading, setLoading] = useState(true)
  const [needsAgreement, setNeedsAgreement] = useState(false)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
        setUserRole(null)
        setNeedsAgreement(false)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId) => {
    try {
      // Try to fetch from students table first
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', userId)
        .single()

      if (studentData && !studentError) {
        setUserProfile(studentData)
        setUserRole('student')
        // Check if student needs to accept agreement
        if (studentData.agreed_to_terms === false || studentData.agreed_to_terms === null) {
          setNeedsAgreement(true)
        } else {
          setNeedsAgreement(false)
        }
        setLoading(false)
        return
      }

      // If not a student, try moderators table
      const { data: moderatorData, error: moderatorError } = await supabase
        .from('moderators')
        .select('*')
        .eq('id', userId)
        .single()

      if (moderatorData && !moderatorError) {
        setUserProfile(moderatorData)
        setUserRole('moderator')
        setLoading(false)
        return
      }

      // User exists but has no profile
      console.error('User has no profile in students or moderators table')
      setLoading(false)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  }

  const value = {
    user,
    userProfile,
    userRole,
    loading,
    needsAgreement,
    setNeedsAgreement,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile: () => user && fetchUserProfile(user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

