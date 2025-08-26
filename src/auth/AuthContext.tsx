import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { User, Session, AuthError } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>
  signUp: (email: string, password: string, fullName: string, orgName?: string) => Promise<{ user: User | null; error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  getCustomUserId: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)

      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN' && session?.user) {
        // Update last login time in custom users table if needed
        const customUserId = session.user.user_metadata?.custom_user_id
        if (customUserId) {
          try {
            await supabase
              .from('users')
              .update({ last_login: new Date().toISOString() })
              .eq('id', customUserId)
          } catch (error) {
            console.warn('Failed to update last login:', error)
          }
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { user: data.user, error }
  }

  const signUp = async (email: string, password: string, fullName: string, orgName?: string) => {
    try {
      // First, create company if orgName is provided
      let companyId = null
      if (orgName) {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert([{ name: orgName }])
          .select('id')
          .single()

        if (companyError) {
          console.error('Company creation error:', companyError)
          throw companyError
        }
        companyId = company.id
      } else {
        // Create default company
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert([{ name: `${email} Company` }])
          .select('id')
          .single()

        if (companyError) {
          console.error('Default company creation error:', companyError)
          throw companyError
        }
        companyId = company.id
      }

      // Sign up user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: orgName || `${email} Company`,
            company_id: companyId,
          }
        }
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Create custom user record
        const { error: customUserError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            email: email,
            full_name: fullName,
            company_id: companyId,
            is_active: true,
          }])

        if (customUserError) {
          console.error('Custom user creation error:', customUserError)
          // Don't throw here, user is already created in auth.users
        }

        // Update auth user metadata with custom user ID
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            custom_user_id: data.user.id,
            company_id: companyId,
          }
        })

        if (updateError) {
          console.warn('Failed to update user metadata:', updateError)
        }
      }

      return { user: data.user, error }
    } catch (error) {
      console.error('SignUp error:', error)
      return { user: null, error: error as AuthError }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('SignOut error:', error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error }
  }

  const getCustomUserId = (): string | null => {
    return user?.user_metadata?.custom_user_id || user?.id || null
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    getCustomUserId,
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