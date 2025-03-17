
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerNames = () => {
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("id, name, company");
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching customers:", error);
        return [];
      }
    },
  });

  const getCustomerName = (customerId?: string) => {
    if (!customerId || !customers) return "-";
    
    const customer = customers.find((c) => c.id === customerId);
    return customer ? (customer.company ? `${customer.company} (${customer.name})` : customer.name) : "-";
  };

  return { customers, getCustomerName };
};
