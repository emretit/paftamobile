
import { ExchangeRates } from "@/components/proposals/form/items/types/currencyTypes";

/**
 * Parse the TCMB XML data to extract exchange rates
 */
const parseTCMBXml = (xmlText: string): ExchangeRates => {
  const rates: ExchangeRates = { TRY: 1 };
  
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Extract rates for common currencies
    const currencies = xmlDoc.getElementsByTagName("Currency");
    for (let i = 0; i < currencies.length; i++) {
      const currency = currencies[i];
      const code = currency.getAttribute("CurrencyCode");
      
      // Only process USD, EUR, and GBP
      if (code && ["USD", "EUR", "GBP"].includes(code)) {
        const forexBuying = currency.getElementsByTagName("ForexBuying")[0]?.textContent;
        
        if (forexBuying) {
          rates[code] = parseFloat(forexBuying);
        }
      }
    }
    
    return rates;
  } catch (error) {
    console.error("Error parsing TCMB XML:", error);
    return {
      TRY: 1,
      USD: 32.5,
      EUR: 35.2,
      GBP: 41.3
    };
  }
};

/**
 * Fetch exchange rates from TCMB and handle CORS issues
 */
export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    // Using a CORS proxy service to access TCMB data
    // This should be replaced with a proper backend endpoint in production
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const tcmbUrl = 'https://www.tcmb.gov.tr/kurlar/today.xml';
    
    const response = await fetch(`${proxyUrl}${encodeURIComponent(tcmbUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch TCMB rates: ${response.status}`);
    }
    
    const xmlText = await response.text();
    return parseTCMBXml(xmlText);
  } catch (error) {
    console.error("Error fetching TCMB exchange rates:", error);
    
    // Return fallback exchange rates if API call fails
    return {
      TRY: 1,
      USD: 32.5,
      EUR: 35.2,
      GBP: 41.3
    };
  }
};

/**
 * API handler for exchange rates
 */
export const getExchangeRates = async (): Promise<Response> => {
  try {
    const rates = await fetchExchangeRates();
    return new Response(JSON.stringify(rates), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Failed to fetch exchange rates",
      fallback: true,
      rates: {
        TRY: 1,
        USD: 32.5,
        EUR: 35.2,
        GBP: 41.3
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
