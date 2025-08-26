import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthContext";

export const useCompanyInfo = () => {
  const { userId } = useAuth();

  const { data: company, isLoading, error } = useQuery({
    queryKey: ["company-info", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // First get current user's company_id
      const { data: currentUser, error: userError } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", userId)
        .single();

      if (userError || !currentUser?.company_id) {
        console.error("Error fetching user company:", userError);
        throw new Error("User company not found");
      }

      // Then get company details
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .eq("id", currentUser.company_id)
        .single();

      if (error) {
        console.error("Error fetching company info:", error);
        throw error;
      }

      return data;
    },
    enabled: !!userId, // Only run query when userId is available
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    company,
    isLoading,
    error,
  };
};