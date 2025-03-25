
import { getExchangeRates } from './exchangeRates';

// Map API paths to handlers
export const apiRoutes = {
  "/api/exchange-rates": getExchangeRates,
};

// Generic API route handler
export const handleApiRequest = async (path: string): Promise<Response> => {
  const handler = apiRoutes[path];
  
  if (handler) {
    try {
      return await handler();
    } catch (error) {
      console.error(`Error handling API request for ${path}:`, error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
};
