
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
          .select("*");
        
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
        
        // Fetch customers and employees separately since the join is causing issues
        const customerIds = data.filter(p => p.customer_id).map(p => p.customer_id);
        const employeeIds = data.filter(p => p.employee_id).map(p => p.employee_id);
        
        let customers = [];
        let employees = [];
        
        if (customerIds.length > 0) {
          const { data: customersData } = await supabase
            .from("customers")
            .select("*")
            .in("id", customerIds);
          customers = customersData || [];
        }
        
        if (employeeIds.length > 0) {
          const { data: employeesData } = await supabase
            .from("employees")
            .select("*")
            .in("id", employeeIds);
          employees = employeesData || [];
        }
        
        // Transform data to match the Proposal type
        return data.map((item: any) => {
          const customer = customers.find(c => c.id === item.customer_id);
          const employee = employees.find(e => e.id === item.employee_id);
          
          return {
            ...item,
            customer: customer || null,
            employee: employee ? {
              id: employee.id,
              first_name: employee.first_name || "Atanmamış",
              last_name: employee.last_name || ""
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
