
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

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
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
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
