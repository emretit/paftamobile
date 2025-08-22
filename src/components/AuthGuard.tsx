
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { checkSessionStatus, clearAuthTokens } from "@/lib/supabase-utils";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthGuard: Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // If user logs out, redirect to landing page
        if (event === 'SIGNED_OUT') {
          // Local storage'ı temizle
          clearAuthTokens();
          navigate('/');
        }
        
        // Session yoksa giriş sayfasına yönlendir
        if (!session && !loading) {
          navigate('/signin');
        }
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      try {
        const result = await checkSessionStatus();
        
        if (result.error) {
          console.error('AuthGuard: Session check error:', result.error);
          setSession(null);
          setUser(null);
          clearAuthTokens();
          navigate('/signin');
        } else {
          console.log('AuthGuard: Initial session check:', result.user?.email);
          
          if (result.hasSession) {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
          } else {
            setSession(null);
            setUser(null);
            navigate('/signin');
          }
        }
      } catch (error) {
        console.error('AuthGuard: Unexpected session check error:', error);
        setSession(null);
        setUser(null);
        clearAuthTokens();
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, [navigate, loading]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user, redirect to signin page
  if (!user || !session) {
    navigate('/signin');
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default AuthGuard;
