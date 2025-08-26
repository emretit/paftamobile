import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !anonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Public Supabase client - used when no authentication token is available
 * This client only has access to public data and RLS policies will restrict access
 */
export const publicClient = createClient(url, anonKey)

/**
 * Creates a Supabase client with a custom JWT token
 * This token is sent via Authorization header so RLS policies can use auth.uid()
 * 
 * @param token - Custom JWT token from our login endpoint
 * @returns Supabase client with authentication context
 * 
 * Note: We never use supabase.auth.* methods as we have custom JWT authentication.
 * The JWT is only sent via Authorization header for RLS to read auth.uid() from the 'sub' claim.
 */
export function createClientWithToken(token: string) {
  const client = createClient(url, anonKey)
  
  // Override the headers for authenticated requests
  const originalRequest = client.rest.fetch
  client.rest.fetch = (url: string, options: any = {}) => {
    return originalRequest(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    })
  }
  
  return client
}