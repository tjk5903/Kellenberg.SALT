// supabase/functions/send-event-reminders/index.ts
// This Edge Function sends 24-hour reminder emails to students AND moderators
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EventReminder {
  signup_id: string
  event_id: string
  event_title: string
  event_description: string
  event_location: string
  event_start_date: string
  event_end_date: string
  student_id: string
  student_email: string
  student_first_name: string
  student_last_name: string
}

interface ModeratorReminder {
  event_id: string
  event_title: string
  event_description: string
  event_location: string
  event_start_date: string
  event_end_date: string
  event_hours: number
  moderator_id: string
  moderator_email: string
  moderator_first_name: string
  moderator_last_name: string
  approved_count: number
  pending_count: number
  student_list: Array<{name: string, email: string, grade: number}>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Checking for events needing reminders...')

    // Get events that need reminders
    const { data: reminders, error: fetchError } = await supabase
      .rpc('get_events_needing_reminders')

    if (fetchError) {
      console.error('Error fetching reminders:', fetchError)
      throw fetchError
    }

    if (!reminders || reminders.length === 0) {
      console.log('No reminders to send')
      return new Response(
        JSON.stringify({ message: 'No reminders to send', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${reminders.length} reminder(s) to send`)

    const results = []
    
    // Send email for each reminder
    for (const reminder of reminders as EventReminder[]) {
      try {
        // Format date and time
        const eventDate = new Date(reminder.event_start_date)
        const eventEndDate = reminder.event_end_date ? new Date(reminder.event_end_date) : null
        
        const dateStr = eventDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        
        const timeStr = eventDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        })
        
        const endTimeStr = eventEndDate ? eventEndDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        }) : null

        // Create email content
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(to right, #1e3a8a, #60a5fa); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFD700; }
              .detail-row { margin: 10px 0; }
              .label { font-weight: bold; color: #1e3a8a; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
              .gold { color: #FFD700; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 Event Reminder</h1>
                <p class="gold">Your S.A.L.T event is tomorrow!</p>
              </div>
              <div class="content">
                <p>Hi ${reminder.student_first_name},</p>
                <p>This is a friendly reminder that you have an approved event tomorrow:</p>
                
                <div class="event-details">
                  <h2 style="margin-top: 0; color: #1e3a8a;">${reminder.event_title}</h2>
                  
                  <div class="detail-row">
                    <span class="label">📅 Date:</span> ${dateStr}
                  </div>
                  
                  <div class="detail-row">
                    <span class="label">🕐 Time:</span> ${timeStr}${endTimeStr ? ` - ${endTimeStr}` : ''}
                  </div>
                  
                  <div class="detail-row">
                    <span class="label">📍 Location:</span> ${reminder.event_location}
                  </div>
                  
                  <div class="detail-row">
                    <span class="label">📝 Description:</span><br/>
                    ${reminder.event_description}
                  </div>
                </div>
                
                <p><strong>Important:</strong> Please arrive on time and be prepared for service!</p>
                
                <p>If you have any questions or can no longer attend, please contact the event moderator as soon as possible.</p>
                
                <p>Thank you for your commitment to service!</p>
                
                <p style="margin-top: 30px;">
                  <strong>S.A.L.T Team</strong><br/>
                  <em>Service • Allegiance • Leadership • Teamwork</em>
                </p>
              </div>
              
              <div class="footer">
                <p>Kellenberg Memorial High School<br/>
                1400 Glenn Curtiss Boulevard, Uniondale, NY 11553</p>
                <p>This is an automated reminder. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `

        // Send email using Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Kellenberg S.A.L.T <salt@firebirdfit.app>',
            to: [reminder.student_email],
            subject: `Reminder: ${reminder.event_title} - Tomorrow!`,
            html: emailHtml,
          }),
        })

        const emailResult = await emailResponse.json()

        if (!emailResponse.ok) {
          console.error('Resend error:', emailResult)
          results.push({
            success: false,
            student_email: reminder.student_email,
            event_title: reminder.event_title,
            error: emailResult,
          })
          continue
        }

        console.log(`Email sent to ${reminder.student_email} for event: ${reminder.event_title}`)

        // Record that email was sent
        const { error: insertError } = await supabase
          .from('email_reminders')
          .insert({
            student_event_id: reminder.signup_id,
            email_type: 'event_reminder',
          })

        if (insertError) {
          console.error('Error recording email reminder:', insertError)
        }

        results.push({
          success: true,
          student_email: reminder.student_email,
          event_title: reminder.event_title,
          email_id: emailResult.id,
        })

      } catch (error) {
        console.error(`Error sending email for ${reminder.student_email}:`, error)
        results.push({
          success: false,
          student_email: reminder.student_email,
          event_title: reminder.event_title,
          error: error.message,
        })
      }
    }

    const studentSuccessCount = results.filter(r => r.success).length
    console.log(`Sent ${studentSuccessCount} out of ${reminders.length} student reminders`)

    // ==========================================
    // PART 2: Send Moderator Reminders
    // ==========================================
    console.log('Checking for moderator event reminders...')

    const { data: moderatorReminders, error: modFetchError } = await supabase
      .rpc('get_moderator_event_reminders')

    if (modFetchError) {
      console.error('Error fetching moderator reminders:', modFetchError)
    }

    const moderatorResults = []

    if (moderatorReminders && moderatorReminders.length > 0) {
      console.log(`Found ${moderatorReminders.length} moderator reminder(s) to send`)

      for (const modReminder of moderatorReminders as ModeratorReminder[]) {
        try {
          // Format date and time
          const eventDate = new Date(modReminder.event_start_date)
          const eventEndDate = modReminder.event_end_date ? new Date(modReminder.event_end_date) : null
          
          const dateStr = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
          
          const timeStr = eventDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
          })
          
          const endTimeStr = eventEndDate ? eventEndDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
          }) : null

          // Build student list HTML
          const studentListHtml = modReminder.student_list && modReminder.student_list.length > 0
            ? modReminder.student_list.map(s => 
                `<li>${s.name} (Grade ${s.grade}) - ${s.email}</li>`
              ).join('')
            : '<li><em>No approved students yet</em></li>'

          // Create moderator email content
          const modEmailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(to right, #1e3a8a, #60a5fa); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFD700; }
                .stats-box { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
                .stat { display: inline-block; margin: 0 20px; }
                .stat-number { font-size: 28px; font-weight: bold; color: #1e3a8a; }
                .stat-label { font-size: 12px; color: #666; }
                .student-list { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
                .student-list ul { margin: 10px 0; padding-left: 20px; }
                .student-list li { margin: 5px 0; }
                .detail-row { margin: 10px 0; }
                .label { font-weight: bold; color: #1e3a8a; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                .gold { color: #FFD700; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📋 Event Tomorrow - Summary</h1>
                  <p class="gold">S.A.L.T. Moderator Reminder</p>
                </div>
                <div class="content">
                  <p>Hi ${modReminder.moderator_first_name},</p>
                  <p>Your event is happening tomorrow! Here's a summary:</p>
                  
                  <div class="event-details">
                    <h2 style="margin-top: 0; color: #1e3a8a;">${modReminder.event_title}</h2>
                    
                    <div class="detail-row">
                      <span class="label">📅 Date:</span> ${dateStr}
                    </div>
                    
                    <div class="detail-row">
                      <span class="label">🕐 Time:</span> ${timeStr}${endTimeStr ? ` - ${endTimeStr}` : ''}
                    </div>
                    
                    <div class="detail-row">
                      <span class="label">📍 Location:</span> ${modReminder.event_location}
                    </div>
                    
                    ${modReminder.event_hours ? `
                    <div class="detail-row">
                      <span class="label">⭐ Service Hours:</span> ${modReminder.event_hours} hours
                    </div>
                    ` : ''}
                  </div>
                  
                  <div class="stats-box">
                    <div class="stat">
                      <div class="stat-number">${modReminder.approved_count}</div>
                      <div class="stat-label">Approved</div>
                    </div>
                    <div class="stat">
                      <div class="stat-number">${modReminder.pending_count}</div>
                      <div class="stat-label">Pending</div>
                    </div>
                  </div>
                  
                  <div class="student-list">
                    <h3 style="margin-top: 0; color: #1e3a8a;">✅ Approved Students</h3>
                    <ul>
                      ${studentListHtml}
                    </ul>
                  </div>
                  
                  <p><strong>Reminders:</strong></p>
                  <ul>
                    <li>Review any pending signups that need approval</li>
                    <li>Prepare attendance tracking for tomorrow</li>
                    <li>Contact students if there are any changes</li>
                  </ul>
                  
                  <p style="margin-top: 30px;">
                    <strong>S.A.L.T Team</strong><br/>
                    <em>Service • Allegiance • Leadership • Teamwork</em>
                  </p>
                </div>
                
                <div class="footer">
                  <p>Kellenberg Memorial High School<br/>
                  1400 Glenn Curtiss Boulevard, Uniondale, NY 11553</p>
                  <p>This is an automated reminder. Please do not reply to this email.</p>
                </div>
              </div>
            </body>
            </html>
          `

          // Send moderator email
          const modEmailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Kellenberg S.A.L.T <salt@firebirdfit.app>',
              to: [modReminder.moderator_email],
              subject: `Event Tomorrow: ${modReminder.event_title} - ${modReminder.approved_count} students`,
              html: modEmailHtml,
            }),
          })

          const modEmailResult = await modEmailResponse.json()

          if (!modEmailResponse.ok) {
            console.error('Moderator email error:', modEmailResult)
            moderatorResults.push({
              success: false,
              moderator_email: modReminder.moderator_email,
              event_title: modReminder.event_title,
              error: modEmailResult,
            })
            continue
          }

          console.log(`Moderator reminder sent to ${modReminder.moderator_email} for event: ${modReminder.event_title}`)

          // Record that moderator reminder was sent (using notification queue)
          await supabase.from('email_notification_queue').insert({
            notification_type: 'reminder_moderator',
            recipient_email: modReminder.moderator_email,
            recipient_name: `${modReminder.moderator_first_name} ${modReminder.moderator_last_name}`,
            event_id: modReminder.event_id,
            event_title: modReminder.event_title,
            event_date: modReminder.event_start_date,
            event_location: modReminder.event_location,
            status: 'sent',
            processed_at: new Date().toISOString(),
          })

          moderatorResults.push({
            success: true,
            moderator_email: modReminder.moderator_email,
            event_title: modReminder.event_title,
            approved_count: modReminder.approved_count,
            email_id: modEmailResult.id,
          })

        } catch (error) {
          console.error(`Error sending moderator reminder:`, error)
          moderatorResults.push({
            success: false,
            moderator_email: modReminder.moderator_email,
            event_title: modReminder.event_title,
            error: error.message,
          })
        }
      }
    }

    const modSuccessCount = moderatorResults.filter(r => r.success).length
    console.log(`Sent ${modSuccessCount} out of ${moderatorReminders?.length || 0} moderator reminders`)

    return new Response(
      JSON.stringify({
        message: 'Email reminders processed',
        studentReminders: {
          total: reminders.length,
          successful: studentSuccessCount,
          failed: reminders.length - studentSuccessCount,
          results,
        },
        moderatorReminders: {
          total: moderatorReminders?.length || 0,
          successful: modSuccessCount,
          failed: (moderatorReminders?.length || 0) - modSuccessCount,
          results: moderatorResults,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
