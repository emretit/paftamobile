import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { action } = await req.json()

    if (action === 'authenticate') {
      // Get Nilvera credentials from environment
      const nilveraApiKey = Deno.env.get('NILVERA_API_KEY')
      const nilveraUsername = Deno.env.get('NILVERA_TEST_USERNAME')
      const nilveraPassword = Deno.env.get('NILVERA_TEST_PASSWORD')

      if (!nilveraApiKey || !nilveraUsername || !nilveraPassword) {
        throw new Error('Nilvera credentials not configured')
      }

      // Nilvera authentication with real credentials
      const authResponse = await fetch('https://apitest.nilvera.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'grant_type': 'client_credentials',
          'client_id': nilveraApiKey,
          'client_secret': nilveraApiKey,
          'scope': 'read write'
        })
      })

      if (!authResponse.ok) {
        const errorData = await authResponse.text()
        console.error('Nilvera authentication failed:', errorData)
        throw new Error(`Nilvera kimlik doğrulama başarısız: ${authResponse.status} ${authResponse.statusText}`)
      }

      const authData = await authResponse.json()
      
      // Store token in database
      const expiresAt = new Date(Date.now() + (authData.expires_in * 1000))
      
      const { error } = await supabaseClient
        .from('nilvera_auth')
        .upsert({
          user_id: user.id,
          access_token: authData.access_token,
          refresh_token: authData.refresh_token,
          expires_at: expiresAt.toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Nilvera kimlik doğrulama başarılı' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Geçersiz işlem' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )

  } catch (error) {
    console.error('Error in nilvera-auth function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Kimlik doğrulama hatası' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})