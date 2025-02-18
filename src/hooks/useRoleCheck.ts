
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type UserRole = 'admin' | 'sales' | 'manager' | 'viewer';

interface UserRoleResponse {
  role: UserRole;
}

export const useRoleCheck = () => {
  return useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .maybeSingle();

      if (error) throw error;
      return data as UserRoleResponse;
    },
  });
};
