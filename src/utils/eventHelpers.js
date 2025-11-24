import { supabase } from '../lib/supabase'

// Helper to convert datetime-local string to ISO string with timezone
const formatDateForDatabase = (dateString) => {
  if (!dateString) return dateString
  // Create a date object from the local datetime string
  const date = new Date(dateString)
  // Convert to ISO string which includes timezone
  return date.toISOString()
}

export const createEvent = async (eventData) => {
  // Format the dates to include timezone information
  const formattedData = {
    ...eventData,
    start_date: formatDateForDatabase(eventData.start_date),
    end_date: formatDateForDatabase(eventData.end_date)
  }
  
  const { data, error } = await supabase
    .from('events')
    .insert([formattedData])
    .select()
    .single()

  return { data, error }
}

export const updateEvent = async (eventId, eventData) => {
  // Format the dates to include timezone information
  const formattedData = {
    ...eventData,
    start_date: formatDateForDatabase(eventData.start_date),
    end_date: formatDateForDatabase(eventData.end_date)
  }
  
  const { data, error } = await supabase
    .from('events')
    .update(formattedData)
    .eq('id', eventId)
    .select()
    .single()

  return { data, error }
}

export const deleteEvent = async (eventId) => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  return { error }
}

export const signUpForEvent = async (studentId, eventId) => {
  const { data, error } = await supabase
    .from('student_event')
    .insert([{
      student_id: studentId,
      event_id: eventId,
      status: 'Pending',
    }])
    .select()
    .single()

  return { data, error }
}

export const cancelEventSignup = async (signupId) => {
  const { error } = await supabase
    .from('student_event')
    .delete()
    .eq('id', signupId)

  return { error }
}

export const updateSignupStatus = async (signupId, status) => {
  const { data, error } = await supabase
    .from('student_event')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', signupId)
    .select()
    .single()

  return { data, error }
}

export const checkExistingSignup = async (studentId, eventId) => {
  const { data, error } = await supabase
    .from('student_event')
    .select('*')
    .eq('student_id', studentId)
    .eq('event_id', eventId)
    .maybeSingle()

  return { data, error }
}

export const getEventSignupCount = async (eventId) => {
  const { count, error } = await supabase
    .from('student_event')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)

  return { count, error }
}

