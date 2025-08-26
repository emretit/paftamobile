import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !anonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Main Supabase client with authentication context
 * This client automatically handles authentication and RLS policies
 */
export const supabase = createClient(url, anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

/**
 * Legacy function for backward compatibility
 * @deprecated Use supabase client directly with Supabase Auth
 */
export function createClientWithToken(token: string) {
  console.warn('createClientWithToken is deprecated. Use supabase client directly.')
  const client = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

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

/**
 * Legacy public client for backward compatibility
 * @deprecated Use supabase client directly
 */
export const publicClient = supabase