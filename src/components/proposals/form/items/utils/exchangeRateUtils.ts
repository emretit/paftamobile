
import { ExchangeRates } from "../types/currencyTypes";
import { toast } from "sonner";

// Default fallback rates if API request fails
const DEFAULT_RATES: ExchangeRates = {
  TRY: 1,
  USD: 32.5,
  EUR: 35.2,
  GBP: 41.3
};

/**
 * Fetches exchange rates from the proxy API endpoint
 * This avoids CORS issues with direct TCMB access
 */
export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    // Use a CORS proxy to fetch the exchange rates
    const response = await fetch('/api/exchange-rates');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Exchange rates fetched successfully:", data);
    
    return {
      TRY: 1, // TRY is always 1 as base currency
      USD: data.USD || DEFAULT_RATES.USD,
      EUR: data.EUR || DEFAULT_RATES.EUR,
      GBP: data.GBP || DEFAULT_RATES.GBP
    };
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    toast.error("Döviz kurları alınamadı, varsayılan değerler kullanılıyor");
    return DEFAULT_RATES;
  }
};

// Function to simulate exchange rate API for development
export const simulateExchangeRatesAPI = async (): Promise<ExchangeRates> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return slightly randomized rates to simulate market fluctuations
  return {
    TRY: 1,
    USD: 32.5 + (Math.random() * 0.5 - 0.25), // 32.25 - 32.75
    EUR: 35.2 + (Math.random() * 0.6 - 0.3),  // 34.9 - 35.5
    GBP: 41.3 + (Math.random() * 0.8 - 0.4)   // 40.9 - 41.7
  };
};

/**
 * Gets exchange rates with fallback to simulation if API fails
 */
export const getExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    return await fetchExchangeRates();
  } catch (error) {
    console.warn("Falling back to simulated exchange rates");
    return simulateExchangeRatesAPI();
  }
};
