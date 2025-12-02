// supabase/functions/send-cancellation-notification/index.ts
// This Edge Function sends cancellation notification emails to moderators
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
    cancelled_at?: string
    original_signup_status?: string
  }
}

// Email template for MODERATOR cancellation notification
function getCancellationEmail(notification: Notification): string {
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

  const cancelledAt = notification.additional_data?.cancelled_at 
    ? new Date(notification.additional_data.cancelled_at).toLocaleString('en-US')
    : 'Just now'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(to right, #dc2626, #f87171); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: #fef2f2; border: 1px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .student-info { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ef4444; }
        .detail-row { margin: 8px 0; }
        .label { font-weight: bold; color: #1e3a8a; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        .cancelled-badge { background: #ef4444; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Signup Cancelled</h1>
          <p style="color: #fecaca;">S.A.L.T. Event Management</p>
        </div>
        <div class="content">
          <p>Hi ${notification.recipient_name?.split(' ')[0] || 'Moderator'},</p>
          
          <div class="alert-box">
            <strong>⚠️ A student has cancelled their signup for your event.</strong>
          </div>
          
          <div class="student-info">
            <h3 style="margin-top: 0; color: #dc2626;">Cancelled Signup</h3>
            <div class="detail-row">
              <span class="label">👤 Student:</span> ${notification.student_name}
            </div>
            <div class="detail-row">
              <span class="label">📧 Email:</span> ${notification.student_email}
            </div>
            <div class="detail-row">
              <span class="label">🕐 Cancelled:</span> ${cancelledAt}
            </div>
            ${notification.additional_data?.original_signup_status ? `
            <div class="detail-row">
              <span class="label">📋 Previous Status:</span> ${notification.additional_data.original_signup_status}
            </div>
            ` : ''}
          </div>
          
          <div class="student-info" style="border-left-color: #3b82f6;">
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
          
          <p>You may want to review your event's current signup numbers and consider reaching out to other students if needed.</p>
          
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

    console.log('Checking for pending cancellation notifications...')

    // Get pending notifications
    const { data: notifications, error: fetchError } = await supabase
      .rpc('get_pending_notifications', { p_limit: 50 })

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError)
      throw fetchError
    }

    // Filter for cancellation notifications only
    const cancelNotifications = (notifications || []).filter(
      (n: Notification) => n.notification_type === 'cancel_moderator'
    )

    if (cancelNotifications.length === 0) {
      console.log('No cancellation notifications to send')
      return new Response(
        JSON.stringify({ message: 'No cancellation notifications to send', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${cancelNotifications.length} cancellation notification(s) to send`)

    const results = []

    for (const notification of cancelNotifications as Notification[]) {
      try {
        // Generate email content
        const emailHtml = getCancellationEmail(notification)
        const subject = `Signup Cancelled: ${notification.student_name} for ${notification.event_title}`

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
            recipient: notification.recipient_email,
            error: emailResult,
          })
          continue
        }

        console.log(`Cancellation email sent to ${notification.recipient_email}`)

        // Mark as sent
        await supabase.rpc('mark_notification_sent', {
          p_notification_id: notification.id
        })

        results.push({
          success: true,
          notification_id: notification.id,
          recipient: notification.recipient_email,
          email_id: emailResult.id,
        })

      } catch (error) {
        console.error(`Error sending notification ${notification.id}:`, error)
        results.push({
          success: false,
          notification_id: notification.id,
          recipient: notification.recipient_email,
          error: error.message,
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    console.log(`Sent ${successCount} out of ${cancelNotifications.length} cancellation notifications`)

    return new Response(
      JSON.stringify({
        message: 'Cancellation notifications processed',
        total: cancelNotifications.length,
        successful: successCount,
        failed: cancelNotifications.length - successCount,
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
