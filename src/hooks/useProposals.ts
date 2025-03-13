
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
        
        // Basic query without filters to get all proposals
        let query = supabase.from("proposals").select(`
          *,
          customer:customer_id(*),
          supplier:supplier_id(*),
          employee:employee_id(*)
        `);

        // Commenting out all filters to display all proposals
        /* 
        // Apply filters if provided
        if (filters) {
          // Search filter
          if (filters.search && filters.search.trim() !== "") {
            query = query.or(
              `title.ilike.%${filters.search}%,proposal_number.ilike.%${filters.search}%`
            );
          }

          // Status filter
          if (filters.status && filters.status !== "all") {
            query = query.eq("status", filters.status);
          }

          // Employee filter
          if (filters.employeeId && filters.employeeId !== "all") {
            query = query.eq("employee_id", filters.employeeId);
          }

          // Date range filter
          if (filters.dateRange?.from && filters.dateRange?.to) {
            query = query
              .gte("created_at", filters.dateRange.from.toISOString())
              .lte("created_at", filters.dateRange.to.toISOString());
          }
        }
        */

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching proposals:", error);
          toast.error("Teklifleri getirirken bir hata oluştu");
          throw error;
        }

        console.log("Fetched proposals:", data);

        // Transform the data to include formatted names
        return (data as any[]).map((proposal) => {
          const employee = proposal.employee;
          const customerName = proposal.customer?.name || proposal.supplier?.name || 'N/A';
          
          return {
            ...proposal,
            employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'N/A',
            customer_name: customerName,
          };
        }) as Proposal[];
      } catch (error) {
        console.error("Error in useProposals:", error);
        throw error;
      }
    },
  });
};
