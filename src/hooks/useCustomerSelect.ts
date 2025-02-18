
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";
import { Supplier } from "@/types/supplier";

export const useCustomerSelect = () => {
  const { data: customers, ...customerQuery } = useQuery({
    queryKey: ["customers-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, company, email, mobile_phone, office_phone, address, representative")
        .order("name");

      if (error) throw error;
      return data as Customer[];
    },
  });

  const { data: suppliers, ...supplierQuery } = useQuery({
    queryKey: ["suppliers-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, name, company, email, mobile_phone, office_phone, address, representative")
        .order("name");

      if (error) throw error;
      return data as Supplier[];
    },
  });

  return {
    customers,
    suppliers,
    isLoading: customerQuery.isLoading || supplierQuery.isLoading,
    error: customerQuery.error || supplierQuery.error,
  };
};
