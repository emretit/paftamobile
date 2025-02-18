
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";

export const useCustomerSelect = () => {
  return useQuery({
    queryKey: ["customers-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, company, email, mobile_phone")
        .order("name");

      if (error) throw error;
      return data as Customer[];
    },
  });
};
