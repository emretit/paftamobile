import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { publicClient, createClientWithToken } from '../lib/supabaseClient'
import { supabase } from '@/integrations/supabase/client'

interface AuthContextType {
  token: string | null
  userId: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  registerAndLogin: (email: string, password: string, fullName: string, orgName?: string) => Promise<void>
  logout: () => void
  getClient: () => ReturnType<typeof createClientWithToken>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_TOKEN_KEY = 'auth_token'

/**
 * Decodes JWT token to extract userId from 'sub' claim
 * Simple base64url decoder without external dependencies
 */
function decodeJwtSub(token: string): string | null {
  try {
    const payload = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(
          atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
          c => c.charCodeAt(0)
        )
      )
    )
    return payload?.sub ?? null
  } catch {
    return null
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load token from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)
      if (storedToken) {
        const decodedUserId = decodeJwtSub(storedToken)
        if (decodedUserId) {
          setToken(storedToken)
          setUserId(decodedUserId)
        } else {
          // Invalid token, remove it
          localStorage.removeItem(AUTH_TOKEN_KEY)
        }
      }
    } catch (error) {
      console.error('Error loading auth token:', error)
      localStorage.removeItem(AUTH_TOKEN_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      // Prefer the edge function that returns a Supabase auth session
      const response = await fetch(
        `https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/custom-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aHd1Zm5ja3BxaXJ4cHR3bmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODI5MjAsImV4cCI6MjA1NDk1ODkyMH0.Wjw8MAnsBrHxB6-J-bNGObgDQ4fl3zPYrgYI5tOrcKo`
          },
          body: JSON.stringify({ email, password })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // If edge function returned a Supabase auth session, use it
      if (data?.session?.access_token && data?.session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        })
        const accessToken: string = data.session.access_token
        const decodedUserId = decodeJwtSub(accessToken)
        if (!decodedUserId) {
          throw new Error('Invalid session token received')
        }
        localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
        setToken(accessToken)
        setUserId(decodedUserId)
        return
      }

      // Fallback: support previous custom token response shape
      const { token: newToken } = data
      const decodedUserId = decodeJwtSub(newToken)
      if (!decodedUserId) {
        throw new Error('Invalid token received')
      }
      localStorage.setItem(AUTH_TOKEN_KEY, newToken)
      setToken(newToken)
      setUserId(decodedUserId)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const registerAndLogin = async (email: string, password: string, fullName: string, orgName?: string): Promise<void> => {
    try {
      // 1) call /functions/v1/register
      const response = await fetch(
        `https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aHd1Zm5ja3BxaXJ4cHR3bmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODI5MjAsImV4cCI6MjA1NDk1ODkyMH0.Wjw8MAnsBrHxB6-J-bNGObgDQ4fl3zPYrgYI5tOrcKo`
          },
          body: JSON.stringify({ email, password, full_name: fullName, org_name: orgName || undefined })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'register_failed')
      }

      // 2) call login(email,password) to get JWT
      try {
        await login(email, password)
      } catch (err: any) {
        // Mark this specific scenario so UI can show correct message
        const msg = typeof err?.message === 'string' ? err.message : 'login_failed'
        throw new Error(`login_failed_after_registration:${msg}`)
      }

      // 3) If org was created, set user_prefs.current_org_id = org_id
      if (data?.org_id && userId) {
        const client = getClient()
        await client.from('user_prefs').upsert({ 
          user_id: userId, 
          current_org_id: data.org_id 
        })
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setToken(null)
    setUserId(null)
  }

  const getClient = () => {
    if (token) {
      return createClientWithToken(token)
    }
    return publicClient
  }

  const value: AuthContextType = {
    token,
    userId,
    loading,
    login,
    registerAndLogin,
    logout,
    getClient
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}