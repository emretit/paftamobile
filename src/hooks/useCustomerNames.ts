
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Customer {
  id: string;
  name: string;
  company?: string;
}

export const useCustomerNames = () => {
  const { data: customers, isLoading, error } = useQuery({
    queryKey: ["customer-names"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("id, name, company")
          .order("name");
          
        if (error) throw error;
        
        return data as Customer[];
      } catch (error) {
        console.error("Error loading customers:", error);
        throw error;
      }
    }
  });
  
  return {
    customers,
    isLoading,
    error
  };
};
