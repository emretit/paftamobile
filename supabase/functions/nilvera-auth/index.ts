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

    const requestBody = await req.text()
    let action = 'authenticate' // default action
    
    if (requestBody) {
      try {
        const parsedBody = JSON.parse(requestBody)
        action = parsedBody.action || 'authenticate'
      } catch (e) {
        console.log('No JSON body provided, using default action:', e)
      }
    }
    
    console.log('Nilvera auth request received, action:', action)

    if (action === 'authenticate') {
      // Get Nilvera API key from environment
      const nilveraApiKey = Deno.env.get('NILVERA_API_KEY')

      if (!nilveraApiKey) {
        throw new Error('Nilvera API key not configured')
      }

      // Test the API key by making a simple request
      const testResponse = await fetch('https://apitest.nilvera.com/general/Credits', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${nilveraApiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!testResponse.ok) {
        console.error('Nilvera API key test failed:', await testResponse.text())
        throw new Error(`Nilvera API key geçersiz: ${testResponse.status}`)
      }

      // Store the API key in database for future use
      const { error } = await supabaseClient
        .from('nilvera_auth')
        .upsert({
          user_id: user.id,
          access_token: nilveraApiKey,
          refresh_token: null,
          expires_at: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString() // 1 year
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Nilvera API key doğrulandı' }),
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