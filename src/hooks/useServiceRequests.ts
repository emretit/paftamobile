
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useServiceRequests = () => {
  return useQuery({
    queryKey: ['service-requests'],
    queryFn: async () => {
      return [];
    }
  });
};
