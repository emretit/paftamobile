import { createClient } from 'npm:@supabase/supabase-js@2'
import * as bcrypt from 'npm:bcryptjs@3'
import jwt from 'npm:jsonwebtoken@9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  error?: string;
}

// Email validation regex (same as register)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'method_not_allowed' }), 
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Initialize Supabase with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET')!;
    
    if (!supabaseUrl || !supabaseServiceKey || !jwtSecret) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'server_error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Parse and validate request body
    let body: LoginRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'invalid_json' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'missing_fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return new Response(
        JSON.stringify({ error: 'invalid_email' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate password length
    if (password.length < 10) {
      return new Response(
        JSON.stringify({ error: 'password_too_short' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    console.log(`Login attempt for email: ${sanitizedEmail}`);

    // Query user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('email', sanitizedEmail)
      .single();

    if (userError || !user) {
      console.log(`Login failed: user not found for ${sanitizedEmail}`);
      return new Response(
        JSON.stringify({ error: 'invalid_credentials' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Compare password with hash
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      console.log(`Login failed: invalid password for ${sanitizedEmail}`);
      return new Response(
        JSON.stringify({ error: 'invalid_credentials' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create JWT payload
    const payload = {
      sub: user.id,
      role: 'authenticated'
    };

    // Sign JWT token
    const token = jwt.sign(payload, jwtSecret, {
      algorithm: 'HS256',
      expiresIn: '1d'
    });

    console.log(`Login successful for: ${sanitizedEmail}`);

    const response: LoginResponse = {
      token
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error during login:', error);
    return new Response(
      JSON.stringify({ error: 'server_error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});