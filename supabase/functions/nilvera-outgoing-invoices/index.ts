import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

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
    const SUPABASE_URL = 'https://vwhwufnckpqirxptwncw.supabase.co';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { filters } = await req.json();

    // Get the user's Nilvera authentication data
    const { data: nilveraAuth, error: authError } = await supabase
      .from('nilvera_auth')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (authError || !nilveraAuth) {
      throw new Error('Nilvera authentication not found or inactive');
    }

    // Here you would make actual API calls to Nilvera to fetch invoices
    // For now, we'll return mock data
    const mockInvoices = [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        customerName: 'Test Müşteri',
        totalAmount: 1000.00,
        currency: 'TRY',
        status: 'sent',
        issueDate: '2024-01-15',
        pdfUrl: null,
        xmlData: null
      }
    ];

    const mockPagination = {
      page: filters?.page || 1,
      pageSize: filters?.pageSize || 10,
      totalCount: 1,
      totalPages: 1
    };

    return new Response(JSON.stringify({ 
      success: true,
      invoices: mockInvoices,
      pagination: mockPagination
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in nilvera-outgoing-invoices function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'An unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});