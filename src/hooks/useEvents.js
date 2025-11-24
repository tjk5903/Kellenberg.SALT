import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          moderators (
            first_name,
            last_name
          )
        `)
        .order('date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return { events, loading, error, refetch: fetchEvents }
}

export const useStudentEventSignups = (studentId) => {
  const [signups, setSignups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSignups = async () => {
    if (!studentId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('student_event')
        .select(`
          *,
          events (
            id,
            title,
            description,
            location,
            date,
            capacity
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSignups(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching signups:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSignups()
  }, [studentId])

  return { signups, loading, error, refetch: fetchSignups }
}

export const useModeratorEvents = (moderatorId) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEvents = async () => {
    if (!moderatorId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', moderatorId)
        .order('date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching moderator events:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [moderatorId])

  return { events, loading, error, refetch: fetchEvents }
}

export const useEventSignups = (eventId) => {
  const [signups, setSignups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSignups = async () => {
    if (!eventId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('student_event')
        .select(`
          *,
          students (
            id,
            first_name,
            last_name,
            email,
            grade,
            registration_year
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSignups(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching event signups:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSignups()
  }, [eventId])

  return { signups, loading, error, refetch: fetchSignups }
}

