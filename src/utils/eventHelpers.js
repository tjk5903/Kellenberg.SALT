import { supabase } from '../lib/supabase'

export const createEvent = async (eventData) => {
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single()

  return { data, error }
}

export const updateEvent = async (eventId, eventData) => {
  const { data, error } = await supabase
    .from('events')
    .update(eventData)
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

