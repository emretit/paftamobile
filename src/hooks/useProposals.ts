
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Proposal, ProposalItem } from "@/types/proposal";
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

        // Parse items JSON field and properly type convert the result
        return (data || []).map(proposal => {
          // Safely parse the items field from the database
          let parsedItems: ProposalItem[] = [];
          
          try {
            if (proposal.items) {
              // If items is an array, map it to ensure it matches ProposalItem structure
              if (Array.isArray(proposal.items)) {
                parsedItems = proposal.items.map((item: any) => ({
                  id: item.id || '',
                  name: item.name || '',
                  quantity: Number(item.quantity) || 0,
                  unit_price: Number(item.unit_price) || 0,
                  tax_rate: Number(item.tax_rate) || 0,
                  total_price: Number(item.total_price) || 0,
                  currency: item.currency
                }));
              }
            }
          } catch (e) {
            console.error("Error parsing proposal items:", e);
            // If there's an error parsing, use an empty array
          }
          
          // Return a properly typed Proposal object
          return {
            ...proposal,
            items: parsedItems
          } as Proposal;
        });
      } catch (error) {
        console.error("Error in useProposals:", error);
        throw error;
      }
    },
  });
};
