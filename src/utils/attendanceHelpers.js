import { supabase } from '../lib/supabase'

/**
 * Check in a student for an event
 * @param {string} signupId - The student_event record ID
 * @returns {Promise<{data: any, error: any}>}
 */
export const checkInStudent = async (signupId) => {
  const { data, error } = await supabase
    .from('student_event')
    .update({ 
      checked_in_at: new Date().toISOString()
    })
    .eq('id', signupId)
    .select()
    .single()

  return { data, error }
}

/**
 * Mark a student as attended for an event
 * @param {string} signupId - The student_event record ID
 * @returns {Promise<{data: any, error: any}>}
 */
export const markAttended = async (signupId) => {
  const { data, error } = await supabase
    .from('student_event')
    .update({ 
      attended: true,
      status: 'Approved' // Ensure status is Approved when marked as attended
    })
    .eq('id', signupId)
    .select()
    .single()

  return { data, error }
}

/**
 * Mark a student as a no-show for an event
 * @param {string} signupId - The student_event record ID
 * @returns {Promise<{data: any, error: any}>}
 */
export const markNoShow = async (signupId) => {
  const { data, error } = await supabase
    .from('student_event')
    .update({ 
      attended: false,
      status: 'No-Show'
    })
    .eq('id', signupId)
    .select()
    .single()

  return { data, error }
}

/**
 * Get student's total hours
 * @param {string} studentId - The student ID
 * @returns {Promise<{hours: number, error: any}>}
 */
export const getStudentTotalHours = async (studentId) => {
  const { data, error } = await supabase
    .from('students')
    .select('total_hours')
    .eq('id', studentId)
    .single()

  if (error) {
    return { hours: 0, error }
  }

  return { hours: data?.total_hours || 0, error: null }
}

/**
 * Accept student agreement terms
 * @param {string} studentId - The student ID
 * @returns {Promise<{data: any, error: any}>}
 */
export const acceptAgreement = async (studentId) => {
  const { data, error } = await supabase
    .from('students')
    .update({ 
      agreed_to_terms: true,
      terms_agreed_at: new Date().toISOString()
    })
    .eq('id', studentId)
    .select()
    .single()

  return { data, error }
}

