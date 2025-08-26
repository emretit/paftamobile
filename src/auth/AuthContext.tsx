import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

import { publicClient, createClientWithToken } from '../lib/supabaseClient'

interface AuthContextType {
  token: string | null
  userId: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({ email, password })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      const { token: newToken } = data
      const decodedUserId = decodeJwtSub(newToken)

      if (!decodedUserId) {
        throw new Error('Invalid token received')
      }

      // Save token and update state
      localStorage.setItem(AUTH_TOKEN_KEY, newToken)
      setToken(newToken)
      setUserId(decodedUserId)
    } catch (error) {
      console.error('Login error:', error)
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