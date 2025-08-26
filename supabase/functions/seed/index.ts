import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting seed function...');

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if demo org already exists (idempotent)
    const { data: existingOrg } = await supabase
      .from('orgs')
      .select('id')
      .eq('name', 'Acme')
      .maybeSingle();

    if (existingOrg) {
      console.log('Demo data already exists, skipping seed');
      return new Response(
        JSON.stringify({ ok: true, message: 'Demo data already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating demo organization...');
    
    // Create org "Acme"
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .insert([{ name: 'Acme' }])
      .select('id')
      .single();

    if (orgError) {
      console.error('Error creating org:', orgError);
      throw new Error('Failed to create organization');
    }

    console.log('Organization created:', org.id);

    // Hash passwords for demo users
    const hashedPassword = await bcrypt.hash('Passw0rd!Strong', 10);

    console.log('Creating demo users...');

    // Insert demo users into auth.users (bypassing RLS with service role)
    const ownerUserId = crypto.randomUUID();
    const memberUserId = crypto.randomUUID();

    // Insert users into auth.users table
    const { error: ownerAuthError } = await supabase.auth.admin.createUser({
      email: 'owner@test.com',
      password: 'Passw0rd!Strong',
      email_confirm: true,
      user_metadata: {
        full_name: 'Demo Owner'
      }
    });

    const { error: memberAuthError } = await supabase.auth.admin.createUser({
      email: 'member@test.com', 
      password: 'Passw0rd!Strong',
      email_confirm: true,
      user_metadata: {
        full_name: 'Demo Member'
      }
    });

    if (ownerAuthError) {
      console.error('Error creating owner user:', ownerAuthError);
      throw new Error('Failed to create owner user');
    }

    if (memberAuthError) {
      console.error('Error creating member user:', memberAuthError);
      throw new Error('Failed to create member user');
    }

    // Get the created user IDs
    const { data: ownerUser } = await supabase.auth.admin.getUserByEmail('owner@test.com');
    const { data: memberUser } = await supabase.auth.admin.getUserByEmail('member@test.com');

    if (!ownerUser.user || !memberUser.user) {
      throw new Error('Failed to retrieve created users');
    }

    console.log('Users created, adding org memberships...');

    // Add org memberships
    const { error: membershipsError } = await supabase
      .from('org_members')
      .insert([
        {
          org_id: org.id,
          user_id: ownerUser.user.id,
          role: 'owner'
        },
        {
          org_id: org.id,
          user_id: memberUser.user.id,
          role: 'member'
        }
      ]);

    if (membershipsError) {
      console.error('Error creating memberships:', membershipsError);
      throw new Error('Failed to create org memberships');
    }

    console.log('Memberships created, adding example items...');

    // Insert example items for the org
    const { data: items, error: itemsError } = await supabase
      .from('example_items')
      .insert([
        {
          org_id: org.id,
          title: 'Demo Item 1',
          created_by: ownerUser.user.id
        },
        {
          org_id: org.id,
          title: 'Demo Item 2', 
          created_by: ownerUser.user.id
        }
      ])
      .select('id, title');

    if (itemsError) {
      console.error('Error creating items:', itemsError);
      throw new Error('Failed to create example items');
    }

    console.log('Seed completed successfully');

    return new Response(
      JSON.stringify({
        ok: true,
        org_id: org.id,
        owner_id: ownerUser.user.id,
        member_id: memberUser.user.id,
        items: items?.map(item => item.id) || []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in seed function:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: 'Seed operation failed'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});