import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { SignUpEmail } from './_templates/signup-email.tsx'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const payload = await req.json()
    console.log('Received payload:', payload)

    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = payload

    console.log('Processing email for:', user.email, 'Action:', email_action_type)

    // Only handle signup confirmations
    if (email_action_type !== 'signup') {
      console.log('Skipping non-signup action:', email_action_type)
      return new Response(JSON.stringify({ success: true, message: 'Skipped' }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if Resend API key exists
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment')
      // Don't block signup, just return success
      return new Response(JSON.stringify({ success: true, message: 'No API key' }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      const resend = new Resend(resendApiKey)

      const html = await renderAsync(
        React.createElement(SignUpEmail, {
          supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
          token,
          token_hash,
          redirect_to,
          user_name: user.user_metadata?.full_name || '',
          company_name: user.user_metadata?.company_name || '',
        })
      )

      const { error } = await resend.emails.send({
        from: 'PAFTA <onboarding@resend.dev>',
        to: [user.email],
        subject: 'PAFTA hesabınızı onaylayın 🚀',
        html,
      })

      if (error) {
        console.error('Resend error:', error)
        // Don't throw error, just log it to avoid blocking signup
        return new Response(JSON.stringify({ success: true, message: 'Email failed but signup continues' }), { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      console.log('Email sent successfully to:', user.email)
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Don't block signup if email fails
      return new Response(JSON.stringify({ success: true, message: 'Email error but signup continues' }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ success: true, message: 'Email sent successfully' }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in auth-emails function:', error)
    // Don't return 500, return 200 to avoid blocking signup
    return new Response(JSON.stringify({ success: true, message: 'Function error but signup continues' }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})