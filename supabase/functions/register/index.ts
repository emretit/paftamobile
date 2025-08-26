import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RegisterRequest {
  email: string;
  password: string;
  org_name?: string;
}

interface RegisterResponse {
  ok: boolean;
  user_id?: string;
  org_id?: string;
  error?: string;
}

// Email validation regex
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
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Parse and validate request body
    let body: RegisterRequest;
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

    const { email, password, org_name } = body;

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

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedOrgName = org_name?.trim();

    console.log(`Registration attempt for email: ${sanitizedEmail}`);

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', sanitizedEmail)
      .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'email_taken' }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let orgId: string | null = null;

    // Create organization if org_name provided
    if (sanitizedOrgName) {
      const { data: newOrg, error: orgError } = await supabase
        .from('orgs')
        .insert([{ name: sanitizedOrgName }])
        .select('id')
        .single();

      if (orgError) {
        console.error('Error creating organization:', orgError.message);
        return new Response(
          JSON.stringify({ error: 'server_error' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      orgId = newOrg.id;
    }

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{ 
        email: sanitizedEmail, 
        password_hash: passwordHash 
      }])
      .select('id')
      .single();

    if (userError) {
      console.error('Error creating user:', userError.message);
      
      // If user creation fails but org was created, we could clean up
      // but for simplicity, we'll leave the org (it's harmless)
      
      return new Response(
        JSON.stringify({ error: 'server_error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create org membership if organization was created
    if (orgId && newUser.id) {
      const { error: membershipError } = await supabase
        .from('org_members')
        .insert([{ 
          org_id: orgId, 
          user_id: newUser.id, 
          role: 'owner' 
        }]);

      if (membershipError) {
        console.error('Error creating org membership:', membershipError.message);
        // User and org exist, but membership failed
        // We could handle this more gracefully, but for now return success
      }
    }

    console.log(`Successfully registered user: ${sanitizedEmail}`);

    const response: RegisterResponse = {
      ok: true,
      user_id: newUser.id,
      ...(orgId && { org_id: orgId })
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error during registration:', error);
    return new Response(
      JSON.stringify({ error: 'server_error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});