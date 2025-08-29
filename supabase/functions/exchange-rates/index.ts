import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface ExchangeRate {
  currency_code: string;
  forex_buying: number;
  forex_selling: number;
  banknote_buying?: number;
  banknote_selling?: number;
  cross_rate?: number;
  update_date: string;
}

// TCMB API'sinden döviz kurlarını çekme
async function fetchFromTCMB(): Promise<ExchangeRate[]> {
  try {
    const response = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml');
    const xmlText = await response.text();
    
    // XML parse etme (basit regex ile)
    const currencyMatches = xmlText.match(/<Currency[^>]*>[\s\S]*?<\/Currency>/g);
    if (!currencyMatches) throw new Error('XML parsing failed');
    
    const rates: ExchangeRate[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    // TRY ekleme
    rates.push({
      currency_code: 'TRY',
      forex_buying: 1,
      forex_selling: 1,
      banknote_buying: 1,
      banknote_selling: 1,
      cross_rate: null,
      update_date: today
    });
    
    for (const match of currencyMatches) {
      const codeMatch = match.match(/CurrencyCode="([^"]+)"/);
      const forexBuyingMatch = match.match(/<ForexBuying>([^<]+)<\/ForexBuying>/);
      const forexSellingMatch = match.match(/<ForexSelling>([^<]+)<\/ForexSelling>/);
      const banknoteBuyingMatch = match.match(/<BanknoteBuying>([^<]+)<\/BanknoteBuying>/);
      const banknoteSellingMatch = match.match(/<BanknoteSelling>([^<]+)<\/BanknoteSelling>/);
      const crossRateMatch = match.match(/<CrossRateUSD>([^<]+)<\/CrossRateUSD>/);
      
      if (codeMatch && forexBuyingMatch && forexSellingMatch) {
        const currencyCode = codeMatch[1];
        
        // Sadece major currencies'leri alalım
        if (['USD', 'EUR', 'GBP', 'CHF', 'CAD', 'AUD', 'SEK', 'NOK', 'DKK'].includes(currencyCode)) {
          rates.push({
            currency_code: currencyCode,
            forex_buying: parseFloat(forexBuyingMatch[1]),
            forex_selling: parseFloat(forexSellingMatch[1]),
            banknote_buying: banknoteBuyingMatch ? parseFloat(banknoteBuyingMatch[1]) : null,
            banknote_selling: banknoteSellingMatch ? parseFloat(banknoteSellingMatch[1]) : null,
            cross_rate: crossRateMatch ? parseFloat(crossRateMatch[1]) : null,
            update_date: today
          });
        }
      }
    }
    
    return rates;
  } catch (error) {
    console.error('TCMB API Error:', error);
    throw error;
  }
}

// Database'e kaydetme
async function saveToDatabase(rates: ExchangeRate[]) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const today = new Date().toISOString().split('T')[0];
  
  // Bugünkü kayıtları sil
  const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/exchange_rates?update_date=eq.${today}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey,
      'Content-Type': 'application/json'
    }
  });
  
  if (!deleteResponse.ok) {
    console.warn('Delete failed:', await deleteResponse.text());
  }
  
  // Yeni kayıtları ekle
  const insertResponse = await fetch(`${supabaseUrl}/rest/v1/exchange_rates`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(rates)
  });
  
  if (!insertResponse.ok) {
    const error = await insertResponse.text();
    throw new Error(`Database insert failed: ${error}`);
  }
  
  return await insertResponse.json();
}

Deno.serve(async (req) => {
  try {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    console.log('Fetching exchange rates from TCMB...');
    
    // TCMB'den kurları çek
    const rates = await fetchFromTCMB();
    console.log(`Fetched ${rates.length} exchange rates`);
    
    // Database'e kaydet
    await saveToDatabase(rates);
    console.log('Exchange rates saved to database');
    
    // Update log'u ekle
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    await fetch(`${supabaseUrl}/rest/v1/exchange_rate_updates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'success',
        updated_at: new Date().toISOString(),
        message: `Successfully updated ${rates.length} exchange rates`,
        count: rates.length
      })
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        rates,
        count: rates.length,
        message: 'Exchange rates updated successfully'
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
    
  } catch (error) {
    console.error('Exchange rates function error:', error);
    
    // Error log'u ekle
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      
      await fetch(`${supabaseUrl}/rest/v1/exchange_rate_updates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'error',
          updated_at: new Date().toISOString(),
          message: error.message || 'Unknown error',
          count: 0
        })
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  }
});
