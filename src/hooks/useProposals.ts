
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Proposal, ProposalItem } from "@/types/proposal";
import { toast } from "sonner";
import { ProposalFilters } from "@/components/proposals/types";

export const useProposals = (filters?: ProposalFilters) => {
  return useQuery({
    queryKey: ["proposals", filters],
    queryFn: async () => {
      try {
        console.log("Fetching proposals with filters:", filters);
        
        let query = supabase.from("proposals").select(`
          *,
          customer:customers(name, company),
          employee:employees(first_name, last_name)
        `);

        // Apply filters if provided
        if (filters?.search) {
          query = query.or(`title.ilike.%${filters.search}%,proposal_number.eq.${parseInt(filters.search) || 0}`);
        }

        if (filters?.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters?.employeeId) {
          query = query.eq('employee_id', filters.employeeId);
        }

        if (filters?.dateRange?.from && filters?.dateRange?.to) {
          query = query
            .gte('created_at', filters.dateRange.from.toISOString())
            .lte('created_at', filters.dateRange.to.toISOString());
        }

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
          
          // Handle potential null or undefined employee data
          const safeEmployee = proposal.employee || null;
          let employeeData = {
            first_name: "",
            last_name: ""
          };
          
          if (safeEmployee && typeof safeEmployee === 'object') {
            // Check if it's an error object
            if (!('error' in safeEmployee)) {
              employeeData = {
                first_name: safeEmployee.first_name || "",
                last_name: safeEmployee.last_name || ""
              };
            }
          }
          
          // Return a properly typed Proposal object
          return {
            ...proposal,
            items: parsedItems,
            employee: employeeData
          } as unknown as Proposal;
        });
      } catch (error) {
        console.error("Error in useProposals:", error);
        throw error;
      }
    },
  });
};
