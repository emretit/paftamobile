
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";

export const useCustomerNames = () => {
  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers-names"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, company");

      if (error) {
        console.error("Error fetching customer names:", error);
        throw error;
      }
      
      return data as Pick<Customer, "id" | "name" | "company">[];
    },
  });

  const getCustomerName = (customerId?: string): string => {
    if (!customerId) return "-";
    
    const customer = customers?.find(c => c.id === customerId);
    if (!customer) return customerId.substring(0, 8);
    
    return customer.company 
      ? `${customer.name} (${customer.company})` 
      : customer.name;
  };

  return {
    customers,
    isLoading,
    getCustomerName
  };
};
