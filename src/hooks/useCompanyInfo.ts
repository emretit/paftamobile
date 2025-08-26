import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCompanyInfo = () => {
  const { data: company, isLoading, error } = useQuery({
    queryKey: ["company-info"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .eq("id", supabase.rpc("current_company_id"))
        .single();

      if (error) {
        console.error("Error fetching company info:", error);
        throw error;
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    company,
    isLoading,
    error,
  };
};