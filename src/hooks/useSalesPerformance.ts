
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SalesPerformanceData } from "@/types/proposal";

export const useSalesPerformance = () => {
  return useQuery({
    queryKey: ["salesPerformance"],
    queryFn: async (): Promise<SalesPerformanceData[]> => {
      const { data, error } = await supabase
        .from('sales_performance')
        .select('*')
        .order('month', { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    },
  });
};
