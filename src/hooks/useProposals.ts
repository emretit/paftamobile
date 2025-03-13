
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Proposal } from "@/types/proposal";
import { toast } from "sonner";

interface ProposalFilters {
  search?: string;
  status?: string;
  employeeId?: string;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
}

export const useProposals = (filters?: ProposalFilters) => {
  return useQuery({
    queryKey: ["proposals", filters],
    queryFn: async () => {
      try {
        console.log("Fetching proposals with filters:", filters);
        
        // Simplified query that doesn't use foreign key relationships
        let query = supabase.from("proposals").select('*');

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching proposals:", error);
          toast.error("Teklifleri getirirken bir hata oluştu");
          throw error;
        }

        console.log("Fetched proposals:", data);

        // Parse items JSON field to ensure it's properly typed
        return (data || []).map(proposal => ({
          ...proposal,
          items: Array.isArray(proposal.items) ? proposal.items : []
        })) as Proposal[];
      } catch (error) {
        console.error("Error in useProposals:", error);
        throw error;
      }
    },
  });
};
