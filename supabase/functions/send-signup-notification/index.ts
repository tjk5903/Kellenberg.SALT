// supabase/functions/send-signup-notification/index.ts
// This Edge Function sends signup confirmation and approval emails to students and moderators
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Notification {
  id: string
  notification_type: string
  recipient_email: string
  recipient_name: string
  event_id: string
  event_title: string
  event_date: string
  event_location: string
  student_name: string
  student_email: string
  moderator_name: string
  additional_data: {
    event_description?: string
    event_end_date?: string
    event_hours?: number
    signup_id?: string
    signup_status?: string
  }
}

// Email template for STUDENT signup confirmation
function getStudentSignupEmail(notification: Notification): string {
  const eventDate = new Date(notification.event_date)
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

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(to right, #1e3a8a, #60a5fa); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #1e3a8a; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        .gold { color: #FFD700; }
        .success-badge { background: #22c55e; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Signup Confirmed!</h1>
          <p class="gold">S.A.L.T. Service Event Registration</p>
        </div>
        <div class="content">
          <p>Hi ${notification.recipient_name?.split(' ')[0] || 'Student'},</p>
          <p>Great news! Your signup for the following event has been received:</p>
          
          <div class="event-details">
            <h2 style="margin-top: 0; color: #1e3a8a;">${notification.event_title}</h2>
            
            <div class="detail-row">
              <span class="label">📅 Date:</span> ${dateStr}
            </div>
            
            <div class="detail-row">
              <span class="label">🕐 Time:</span> ${timeStr}
            </div>
            
            <div class="detail-row">
              <span class="label">📍 Location:</span> ${notification.event_location}
            </div>
            
            ${notification.additional_data?.event_hours ? `
            <div class="detail-row">
              <span class="label">⭐ Service Hours:</span> ${notification.additional_data.event_hours} hours
            </div>
            ` : ''}
            
            ${notification.additional_data?.event_description ? `
            <div class="detail-row">
              <span class="label">📝 Description:</span><br/>
              ${notification.additional_data.event_description}
            </div>
            ` : ''}
          </div>
          
          <p><span class="success-badge">Status: Pending Approval</span></p>
          
          <p>Your signup is currently pending approval from the event moderator (${notification.moderator_name}). You will be notified once your signup is approved.</p>
          
          <p><strong>What's Next?</strong></p>
          <ul>
            <li>Wait for approval from the event moderator</li>
            <li>Check your email for updates on your signup status</li>
            <li>You'll receive a reminder 24 hours before the event</li>
          </ul>
          
          <p>Thank you for your commitment to service!</p>
          
          <p style="margin-top: 30px;">
            <strong>S.A.L.T Team</strong><br/>
            <em>Service • Allegiance • Leadership • Teamwork</em>
          </p>
        </div>
        
        <div class="footer">
          <p>Kellenberg Memorial High School<br/>
          1400 Glenn Curtiss Boulevard, Uniondale, NY 11553</p>
          <p>This is an automated confirmation. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Email template for STUDENT approval notification
function getStudentApprovalEmail(notification: Notification): string {
  const eventDate = new Date(notification.event_date)
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

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(to right, #059669, #10b981); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFD700; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #059669; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        .gold { color: #FFD700; }
        .approved-badge { background: #10b981; color: white; padding: 8px 20px; border-radius: 25px; display: inline-block; font-size: 16px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 You're Approved!</h1>
          <p class="gold">S.A.L.T. Service Event Confirmation</p>
        </div>
        <div class="content">
          <p>Hi ${notification.recipient_name?.split(' ')[0] || 'Student'},</p>
          <p>Congratulations! Your signup has been <strong>approved</strong> by the event moderator!</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <span class="approved-badge">✓ APPROVED</span>
          </div>
          
          <div class="event-details">
            <h2 style="margin-top: 0; color: #059669;">${notification.event_title}</h2>
            
            <div class="detail-row">
              <span class="label">📅 Date:</span> ${dateStr}
            </div>
            
            <div class="detail-row">
              <span class="label">🕐 Time:</span> ${timeStr}
            </div>
            
            <div class="detail-row">
              <span class="label">📍 Location:</span> ${notification.event_location}
            </div>
            
            ${notification.additional_data?.event_hours ? `
            <div class="detail-row">
              <span class="label">⭐ Service Hours:</span> ${notification.additional_data.event_hours} hours
            </div>
            ` : ''}
            
            ${notification.additional_data?.event_description ? `
            <div class="detail-row">
              <span class="label">📝 Description:</span><br/>
              ${notification.additional_data.event_description}
            </div>
            ` : ''}
          </div>
          
          <p><strong>What's Next?</strong></p>
          <ul>
            <li>Mark your calendar for the event date</li>
            <li>Arrive on time and prepared for service</li>
            <li>You'll receive a reminder 24 hours before the event</li>
            <li>If you can no longer attend, please cancel as soon as possible</li>
          </ul>
          
          <p>Thank you for your commitment to service and community!</p>
          
          <p style="margin-top: 30px;">
            <strong>S.A.L.T Team</strong><br/>
            <em>Service • Allegiance • Leadership • Teamwork</em>
          </p>
        </div>
        
        <div class="footer">
          <p>Kellenberg Memorial High School<br/>
          1400 Glenn Curtiss Boulevard, Uniondale, NY 11553</p>
          <p>This is an automated confirmation. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Email template for MODERATOR new signup notification
function getModeratorSignupEmail(notification: Notification): string {
  const eventDate = new Date(notification.event_date)
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

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(to right, #1e3a8a, #60a5fa); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .student-info { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }
        .detail-row { margin: 8px 0; }
        .label { font-weight: bold; color: #1e3a8a; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        .gold { color: #FFD700; }
        .btn { display: inline-block; background: #1e3a8a; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 New Student Signup</h1>
          <p class="gold">S.A.L.T. Event Management</p>
        </div>
        <div class="content">
          <p>Hi ${notification.recipient_name?.split(' ')[0] || 'Moderator'},</p>
          
          <div class="alert-box">
            <strong>🔔 A new student has signed up for your event!</strong>
          </div>
          
          <div class="student-info">
            <h3 style="margin-top: 0; color: #1e3a8a;">Student Information</h3>
            <div class="detail-row">
              <span class="label">👤 Name:</span> ${notification.student_name}
            </div>
            <div class="detail-row">
              <span class="label">📧 Email:</span> ${notification.student_email}
            </div>
          </div>
          
          <div class="student-info">
            <h3 style="margin-top: 0; color: #1e3a8a;">Event Details</h3>
            <div class="detail-row">
              <span class="label">📌 Event:</span> ${notification.event_title}
            </div>
            <div class="detail-row">
              <span class="label">📅 Date:</span> ${dateStr}
            </div>
            <div class="detail-row">
              <span class="label">🕐 Time:</span> ${timeStr}
            </div>
            <div class="detail-row">
              <span class="label">📍 Location:</span> ${notification.event_location}
            </div>
          </div>
          
          <p><strong>Action Required:</strong> Please review and approve or decline this signup in the S.A.L.T. dashboard.</p>
          
          <p style="margin-top: 30px;">
            <strong>S.A.L.T Team</strong><br/>
            <em>Service • Allegiance • Leadership • Teamwork</em>
          </p>
        </div>
        
        <div class="footer">
          <p>Kellenberg Memorial High School<br/>
          1400 Glenn Curtiss Boulevard, Uniondale, NY 11553</p>
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `
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

    console.log('Checking for pending signup notifications...')

    // Get pending notifications (signup_student and signup_moderator types)
    const { data: notifications, error: fetchError } = await supabase
      .rpc('get_pending_notifications', { p_limit: 50 })

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError)
      throw fetchError
    }

    // Filter for signup and approval notifications
    const signupNotifications = (notifications || []).filter(
      (n: Notification) => n.notification_type === 'signup_student' || 
                           n.notification_type === 'signup_moderator' ||
                           n.notification_type === 'approval_student'
    )

    if (signupNotifications.length === 0) {
      console.log('No signup/approval notifications to send')
      return new Response(
        JSON.stringify({ message: 'No signup/approval notifications to send', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${signupNotifications.length} signup/approval notification(s) to send`)

    const results = []

    for (const notification of signupNotifications as Notification[]) {
      try {
        // Generate email content based on type
        let emailHtml: string
        let subject: string
        
        if (notification.notification_type === 'signup_student') {
          emailHtml = getStudentSignupEmail(notification)
          subject = `Signup Confirmed: ${notification.event_title}`
        } else if (notification.notification_type === 'approval_student') {
          emailHtml = getStudentApprovalEmail(notification)
          subject = `Approved! ${notification.event_title}`
        } else {
          emailHtml = getModeratorSignupEmail(notification)
          subject = `New Signup: ${notification.student_name} for ${notification.event_title}`
        }

        // Send email using Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Kellenberg S.A.L.T <salt@firebirdfit.app>',
            to: [notification.recipient_email],
            subject: subject,
            html: emailHtml,
          }),
        })

        const emailResult = await emailResponse.json()

        if (!emailResponse.ok) {
          console.error('Resend error:', emailResult)
          
          // Mark as failed
          await supabase.rpc('mark_notification_failed', {
            p_notification_id: notification.id,
            p_error: JSON.stringify(emailResult)
          })
          
          results.push({
            success: false,
            notification_id: notification.id,
            type: notification.notification_type,
            recipient: notification.recipient_email,
            error: emailResult,
          })
          continue
        }

        console.log(`Email sent to ${notification.recipient_email} (${notification.notification_type})`)

        // Mark as sent
        await supabase.rpc('mark_notification_sent', {
          p_notification_id: notification.id
        })

        results.push({
          success: true,
          notification_id: notification.id,
          type: notification.notification_type,
          recipient: notification.recipient_email,
          email_id: emailResult.id,
        })

      } catch (error) {
        console.error(`Error sending notification ${notification.id}:`, error)
        results.push({
          success: false,
          notification_id: notification.id,
          type: notification.notification_type,
          recipient: notification.recipient_email,
          error: error.message,
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    console.log(`Sent ${successCount} out of ${signupNotifications.length} signup/approval notifications`)

    return new Response(
      JSON.stringify({
        message: 'Signup/approval notifications processed',
        total: signupNotifications.length,
        successful: successCount,
        failed: signupNotifications.length - successCount,
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
