import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ConfirmationEmail } from './_templates/confirmation-email.tsx'
import { PasswordResetEmail } from './_templates/password-reset.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('AUTH_HOOK_SECRET') as string

interface AuthEmailData {
  token: string
  token_hash: string
  redirect_to: string
  email_action_type: string
  site_url: string
  token_new?: string
  token_hash_new?: string
}

interface User {
  email: string
  id: string
  user_metadata?: Record<string, any>
}

interface WebhookPayload {
  user: User
  email_data: AuthEmailData
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    console.log('Received auth email request')
    
    // Verify webhook signature if secret is available
    if (hookSecret) {
      const wh = new Webhook(hookSecret)
      try {
        const verifiedPayload = wh.verify(payload, headers) as WebhookPayload
        await sendAuthEmail(verifiedPayload)
      } catch (error) {
        console.error('Webhook verification failed:', error)
        return new Response(
          JSON.stringify({ error: 'Webhook verification failed' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        )
      }
    } else {
      // Fallback: parse payload directly (development mode)
      console.log('No webhook secret found, parsing payload directly')
      const parsedPayload = JSON.parse(payload) as WebhookPayload
      await sendAuthEmail(parsedPayload)
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  } catch (error) {
    console.error('Error in auth-emails function:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  }
})

async function sendAuthEmail(payload: WebhookPayload) {
  const {
    user,
    email_data: { token, token_hash, redirect_to, email_action_type },
  } = payload

  console.log(`Sending ${email_action_type} email to ${user.email}`)

  let html: string
  let subject: string

  // Determine email template and subject based on action type
  switch (email_action_type) {
    case 'signup':
      html = await renderAsync(
        React.createElement(ConfirmationEmail, {
          supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
          token,
          token_hash,
          redirect_to: redirect_to || `${Deno.env.get('SUPABASE_URL')}/dashboard`,
          email_action_type,
          user_email: user.email,
        })
      )
      subject = 'PAFTA - Hesabınızı Onaylayın'
      break
    
    case 'recovery':
      html = await renderAsync(
        React.createElement(PasswordResetEmail, {
          supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
          token,
          token_hash,
          redirect_to: redirect_to || `${Deno.env.get('SUPABASE_URL')}/auth`,
          email_action_type,
          user_email: user.email,
        })
      )
      subject = 'PAFTA - Şifre Sıfırlama'
      break
    
    default:
      // Fallback to confirmation email for other types
      html = await renderAsync(
        React.createElement(ConfirmationEmail, {
          supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
          token,
          token_hash,
          redirect_to: redirect_to || `${Deno.env.get('SUPABASE_URL')}/dashboard`,
          email_action_type,
          user_email: user.email,
        })
      )
      subject = 'PAFTA - E-posta Onayı'
      break
  }

  // Send email using Resend
  const { data, error } = await resend.emails.send({
    from: 'PAFTA <onboarding@resend.dev>',
    to: [user.email],
    subject,
    html,
  })

  if (error) {
    console.error('Resend error:', error)
    throw error
  }

  console.log('Email sent successfully:', data)
}