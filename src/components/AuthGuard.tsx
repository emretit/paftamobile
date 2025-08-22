
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
          
          if (result.hasSession && result.user) {
            // Create a mock session object for compatibility
            const mockSession = {
              access_token: localStorage.getItem('session_token') || '',
              user: result.user
            };
            setSession(mockSession as any);
            setUser(result.user as any);
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
  }, [navigate]);

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
