import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export const useUsers = (userId?: string) => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('useUsers: userId is null, returning null.');
        return null;
      }
      
      // Sadece public.users tablosundan veri çek
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user data from public.users:', error);
        return null;
      }
      
      return data as User;
    },
    enabled: !!userId,
    retry: 1,
    retryDelay: 1000,
  });

  return { user, isLoading };
};
