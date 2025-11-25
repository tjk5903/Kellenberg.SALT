// supabase/functions/send-event-reminders/index.ts
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
            from: 'Kellenberg S.A.L.T <onboarding@resend.dev>', // Change this to your verified domain
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

    const successCount = results.filter(r => r.success).length
    console.log(`Sent ${successCount} out of ${reminders.length} reminders`)

    return new Response(
      JSON.stringify({
        message: 'Email reminders processed',
        total: reminders.length,
        successful: successCount,
        failed: reminders.length - successCount,
        results,
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

