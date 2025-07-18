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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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
      console.error('User authentication failed')
      throw new Error('Yetkilendirme gereklidir')
    }

    // Parse request body safely
    let action = 'authenticate'
    let username = ''
    let password = ''
    let userApiKey = ''
    try {
      const body = await req.json()
      action = body.action || 'authenticate'
      username = body.username || ''
      password = body.password || ''
      userApiKey = body.apiKey || ''
    } catch (e) {
      console.log('Using default action authenticate')
    }
    
    console.log('Processing action:', action)

    if (action === 'get_status') {
      // Check if user has existing Nilvera auth
      const { data: authData, error: authError } = await supabaseClient
        .from('nilvera_auth')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (authData && !authError) {
        return new Response(
          JSON.stringify({ success: true, connected: true, message: 'Nilvera bağlantısı mevcut' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } else {
        return new Response(
          JSON.stringify({ success: true, connected: false, message: 'Nilvera bağlantısı yok' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }
    }

    if (action === 'authenticate') {
      console.log('Starting Nilvera authentication...')
      
      if (!username || !password || !userApiKey) {
        console.error('Username, password or API key not provided')
        throw new Error('Kullanıcı adı, şifre ve API key gerekli')
      }

      // Test the user provided API key by making a simple request
      const testResponse = await fetch('https://apitest.nilvera.com/general/Credits', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userApiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!testResponse.ok) {
        console.error('Nilvera API key test failed:', await testResponse.text())
        throw new Error(`Nilvera API key geçersiz: ${testResponse.status}`)
      }

      // Store the credentials in database for future use
      const { error } = await supabaseClient
        .from('nilvera_auth')
        .upsert({
          user_id: user.id,
          access_token: userApiKey,
          refresh_token: JSON.stringify({ username, password }), // Store username/password in refresh_token field
          expires_at: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString() // 1 year
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Nilvera hesap bilgileri doğrulandı' }),
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