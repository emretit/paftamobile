import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { supabase } from '@/lib/supabaseClient';

interface UserData {
  id: string;
  full_name: string | null;
  email: string;
  company_id: string | null;
}

export const useCurrentUser = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setLoading(false);
        setUserData(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, company_id')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setUserData(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError(err.message);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  return {
    userData,
    loading,
    error,
    displayName: userData?.full_name || user?.user_metadata?.full_name || 'Kullanıcı',
    userInitials: userData?.full_name
      ? userData.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : user?.email?.slice(0, 2).toUpperCase() || 'U'
  };
};