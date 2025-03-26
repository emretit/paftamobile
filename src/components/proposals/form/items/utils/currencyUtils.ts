
import { ExchangeRates, CurrencyOption } from "../types/currencyTypes";

// Format a currency value for display
export const formatCurrencyValue = (amount: number, currency: string = "TRY"): string => {
  // Ensure currency is not empty to avoid Intl.NumberFormat errors
  if (!currency) currency = "TRY";
  
  const formatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

// Fetch exchange rates directly from TCMB
export const fetchTCMBExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    const response = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const xmlText = await response.text();
    
    // Parse XML using browser's DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Create the rates object
    const rates: ExchangeRates = { TRY: 1 };
    
    // Get all Currency nodes
    const currencyNodes = xmlDoc.getElementsByTagName("Currency");
    
    for (let i = 0; i < currencyNodes.length; i++) {
      const currencyNode = currencyNodes[i];
      const currencyCode = currencyNode.getAttribute("CurrencyCode");
      
      if (currencyCode && ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'].includes(currencyCode)) {
        const forexBuyingNode = currencyNode.getElementsByTagName("ForexBuying")[0];
        if (forexBuyingNode && forexBuyingNode.textContent) {
          // Convert comma to dot for decimal and parse as float
          rates[currencyCode] = parseFloat(forexBuyingNode.textContent.replace(',', '.'));
        }
      }
    }
    
    console.log("Fetched exchange rates:", rates);
    return rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    // Return fallback exchange rates if API call fails
    return {
      TRY: 1,
      USD: 32.5,
      EUR: 35.2,
      GBP: 41.3
    };
  }
};

// Convert an amount from one currency to another
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRates
): number => {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) return amount;
  
  // Handle TRY as the base currency 
  if (fromCurrency === "TRY") {
    return amount / (rates[toCurrency] || 1);
  }
  
  // Convert from source currency to TRY first, then to target currency
  const amountInTRY = amount * (rates[fromCurrency] || 1);
  return toCurrency === "TRY" ? amountInTRY : amountInTRY / (rates[toCurrency] || 1);
};

// Format a price with a specified number of decimal places
export const formatPrice = (price: number, decimals: number = 2): string => {
  return price.toFixed(decimals);
};

// Add currency symbol to a formatted price
export const addCurrencySymbol = (price: string, currency: string): string => {
  const symbols: Record<string, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };
  
  return `${symbols[currency] || currency} ${price}`;
};

// Get currency symbol for a given currency code
export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };
  
  return symbols[currency] || currency;
};

// Get currency options for dropdowns
export const getCurrencyOptions = (): CurrencyOption[] => {
  return [
    { value: "TRY", label: "₺ TRY", symbol: "₺" },
    { value: "USD", label: "$ USD", symbol: "$" },
    { value: "EUR", label: "€ EUR", symbol: "€" },
    { value: "GBP", label: "£ GBP", symbol: "£" }
  ];
};

// Get current exchange rates (for synchronous contexts)
export const getCurrentExchangeRates = (): ExchangeRates => {
  // Default rates (these will be replaced by API values when available)
  return {
    TRY: 1,
    USD: 32.5,
    EUR: 35.2,
    GBP: 41.3
  };
};

// Format exchange rate display
export const formatExchangeRate = (fromCurrency: string, toCurrency: string, rate: number): string => {
  return `1 ${fromCurrency} = ${rate.toFixed(2)} ${toCurrency}`;
};

// Calculate exchange rate between two currencies
export const calculateExchangeRate = (fromCurrency: string, toCurrency: string, rates: ExchangeRates): number => {
  if (fromCurrency === toCurrency) return 1;
  
  if (fromCurrency === 'TRY') {
    return 1 / (rates[toCurrency] || 1);
  }
  
  if (toCurrency === 'TRY') {
    return rates[fromCurrency] || 1;
  }
  
  // Cross-currency rate
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  return fromRate / toRate;
};
