
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProposalFilters } from "@/components/proposals/types";
import { toast } from "sonner";

export const useProposals = (filters?: ProposalFilters) => {
  return useQuery({
    queryKey: ["proposals", filters],
    queryFn: async () => {
      try {
        console.info("Fetching proposals with filters:", filters);
        
        // Start building the query
        let query = supabase
          .from("proposals")
          .select(`
            *,
            customer:customer_id(*),
            employee:employee_id(*)
          `);
        
        // Apply filters if provided
        if (filters) {
          if (filters.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
          }
          
          if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
          }
          
          if (filters.employeeId) {
            query = query.eq('employee_id', filters.employeeId);
          }
          
          if (filters.dateRange && filters.dateRange.from && filters.dateRange.to) {
            const fromDate = filters.dateRange.from.toISOString();
            const toDate = filters.dateRange.to.toISOString();
            query = query.gte('created_at', fromDate).lte('created_at', toDate);
          }
        }
        
        // Execute the query
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching proposals:", error);
          throw error;
        }
        
        // Transform data to match the Proposal type
        return data.map((item: any) => {
          // Check if employee data exists and is valid
          const safeEmployee = item.employee || { id: null, first_name: "Unassigned", last_name: "" };
          
          return {
            ...item,
            customer: item.customer || null,
            employee: safeEmployee ? {
              id: safeEmployee.id,
              first_name: safeEmployee.first_name || "Unassigned",
              last_name: safeEmployee.last_name || ""
            } : null
          };
        });
      } catch (error) {
        console.error("Error in useProposals:", error);
        toast.error("Teklifler yüklenirken bir hata oluştu");
        throw error;
      }
    }
  });
};
