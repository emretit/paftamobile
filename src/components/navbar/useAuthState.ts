
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { checkSessionStatus, clearAuthTokens } from "@/lib/supabase-utils";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Session'ı güncelle
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Session yoksa local storage'ı temizle
        if (!session) {
          clearAuthTokens();
        }
      }
    );

    // Then check for existing session
    const checkSession = async () => {
      try {
        const result = await checkSessionStatus();
        
        if (result.error) {
          console.error('Session check error:', result.error);
          // Hata durumunda session'ı temizle
          setSession(null);
          setUser(null);
          clearAuthTokens();
        } else {
          console.log('Initial session check:', result.user?.email);
          setSession(result.hasSession ? await supabase.auth.getSession().then(r => r.data.session) : null);
          setUser(result.user);
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

    return () => subscription.unsubscribe();
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
      // Önce session kontrolü yap
      const result = await checkSessionStatus();
      
      if (!result.hasSession) {
        console.log('No active session to sign out from');
        return;
      }

      const { error } = await supabase.auth.signOut({
        scope: 'global'
      });
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      // Local storage'ı temizle
      clearAuthTokens();
      
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
