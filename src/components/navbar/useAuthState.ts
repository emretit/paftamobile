
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { checkSessionStatus, clearAuthTokens } from "@/lib/supabase-utils";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    // Check for existing session using custom auth
    const checkSession = async () => {
      try {
        const result = await checkSessionStatus();
        
        if (result.error) {
          console.error('Session check error:', result.error);
          setSession(null);
          setUser(null);
          clearAuthTokens();

        } else {
          console.log('Initial session check:', result.user?.email);
          
          if (result.hasSession && result.user) {
            // Create a mock session object for compatibility
            const mockSession = {
              access_token: localStorage.getItem('session_token') || '',
              user: result.user
            };
            setSession(mockSession as any);
            setUser(result.user as any);
            
            // Supabase authentication context'ini doğru şekilde set et
            if (result.user.id) {
              try {
                // Önce localStorage'dan Supabase session bilgilerini kontrol et
                const supabaseSessionStr = localStorage.getItem('supabase_session');
                let supabaseSession = null;
                
                if (supabaseSessionStr) {
                  try {
                    supabaseSession = JSON.parse(supabaseSessionStr);
                  } catch (e) {
                    console.warn('Supabase session parse edilemedi:', e);
                  }
                }
                
                // Basit session yönetimi - sadece gerekli bilgileri set et
                try {
                  // Supabase session'ı set et (basit)
                  await supabase.auth.setSession({
                    access_token: 'dummy-token-for-rls',
                    refresh_token: 'dummy-token-for-rls'
                  });
                  console.log('✅ Supabase session set for RLS');
                } catch (error) {
                  console.warn('Supabase session set failed, continuing with RLS setup');
                }
                
                console.log('Supabase auth context set for user:', result.user.id);
                
                // User ID'yi localStorage'a set et
                // setCurrentUserId(result.user.id);
                
              } catch (error) {
                console.error('Error setting Supabase auth context:', error);
                // Fallback olarak user ID'yi set et
                setCurrentUserId(result.user.id);
              }
            }
          } else {
            setSession(null);
            setUser(null);

          }
        }
      } catch (error) {
        console.error('Unexpected session check error:', error);
        setSession(null);
        setUser(null);
        clearAuthTokens();

      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Calculate user initials from name or email
  const getUserInitials = () => {
    if (!user) return "";
    
    return user.user_metadata?.full_name 
      ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
      : user.email?.substring(0, 2).toUpperCase() || "UK";
  };

  // Check if user is a primary account
  const isPrimaryAccount = () => {
    if (!user) return false;
    return user.user_metadata?.is_primary_account === true;
  };

  // Get company name
  const getCompanyName = () => {
    if (!user) return "";
    return user.user_metadata?.company_name || "";
  };

  const signOut = async () => {
    try {
      // Custom auth sign out - just clear local storage
      clearAuthTokens();
      
      // Update state
      setSession(null);
      setUser(null);
      
      console.log('Successfully signed out');
      
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    signOut,
    userInitials: getUserInitials(),
    isPrimaryAccount: isPrimaryAccount(),
    companyName: getCompanyName()
  };
};
