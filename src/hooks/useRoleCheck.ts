
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRoleCheck = () => {
  return useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .single();

      if (error) throw error;
      return roles;
    },
  });
};
