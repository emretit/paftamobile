import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';

interface UserData {
  id: string;
  full_name: string | null;
  email: string;
  company_id: string | null;
}

export const useCurrentUser = () => {
  const { userId, getClient } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const client = getClient();
        const { data, error } = await client
          .from('users')
          .select('id, full_name, email, company_id')
          .eq('id', userId)
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
  }, [userId, getClient]);

  return {
    userData,
    loading,
    error,
    displayName: userData?.full_name || 'Kullanıcı',
    userInitials: userData?.full_name 
      ? userData.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'U'
  };
};