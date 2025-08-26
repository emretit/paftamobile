import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { createHmac } from 'node:crypto'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JWTRequest {
  action: 'generate' | 'validate' | 'refresh'
  user_id?: string
  project_id?: string
  email?: string
  role?: string
  token?: string
}

interface JWTResponse {
  success: boolean
  token?: string
  payload?: any
  error?: string
}

// Base64 URL encode without padding
function base64UrlEncode(data: string): string {
  return btoa(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Base64 URL decode with padding
function base64UrlDecode(data: string): string {
  const padding = '='.repeat((4 - (data.length % 4)) % 4)
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/') + padding
  return atob(base64)
}

// Generate JWT token
function generateJWT(payload: any, secret: string): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  
  const data = `${encodedHeader}.${encodedPayload}`
  const signature = createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return `${data}.${signature}`
}

// Validate JWT token
function validateJWT(token: string, secret: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' }
    }

    const [encodedHeader, encodedPayload, signature] = parts
    const data = `${encodedHeader}.${encodedPayload}`
    
    const expectedSignature = createHmac('sha256', secret)
      .update(data)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' }
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload))
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: 'Token expired' }
    }

    return { valid: true, payload }
  } catch (error) {
    return { valid: false, error: 'Token parsing failed' }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET')

    if (!supabaseUrl || !supabaseServiceKey || !jwtSecret) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body: JWTRequest = await req.json()
    const { action } = body

    let response: JWTResponse

    switch (action) {
      case 'generate': {
        const { user_id, project_id, email, role = 'user' } = body
        
        if (!user_id || !email) {
          response = { success: false, error: 'user_id and email are required for token generation' }
          break
        }

        const payload = {
          sub: user_id,
          user_id,
          project_id,
          email,
          role,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
          aud: 'authenticated',
          iss: 'supabase'
        }

        const token = generateJWT(payload, jwtSecret)
        response = { success: true, token, payload }
        break
      }

      case 'validate': {
        const { token } = body
        
        if (!token) {
          response = { success: false, error: 'Token is required for validation' }
          break
        }

        const validation = validateJWT(token, jwtSecret)
        
        if (validation.valid) {
          response = { success: true, payload: validation.payload }
        } else {
          response = { success: false, error: validation.error }
        }
        break
      }

      case 'refresh': {
        const { token } = body
        
        if (!token) {
          response = { success: false, error: 'Token is required for refresh' }
          break
        }

        const validation = validateJWT(token, jwtSecret)
        
        if (!validation.valid) {
          response = { success: false, error: 'Invalid token for refresh' }
          break
        }

        // Generate new token with extended expiry
        const oldPayload = validation.payload
        const newPayload = {
          ...oldPayload,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
        }

        const newToken = generateJWT(newPayload, jwtSecret)
        response = { success: true, token: newToken, payload: newPayload }
        break
      }

      default:
        response = { success: false, error: 'Invalid action. Use: generate, validate, or refresh' }
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: response.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('JWT function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})