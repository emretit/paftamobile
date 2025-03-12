
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SalesPerformanceData {
  month: string;
  total_proposals: number;
  accepted_proposals: number;
  total_value: number;
  conversion_rate: number;
  avg_deal_size: number;
  growth_rate: number;
}

export const useSalesPerformance = () => {
  return useQuery({
    queryKey: ["sales-performance"],
    queryFn: async (): Promise<SalesPerformanceData[]> => {
      // Since there's no sales_performance table, we'll create a sample data
      // In a real application, this would come from a database query or RPC call
      
      // Mock data representing 6 months of sales performance
      const mockData: SalesPerformanceData[] = [
        {
          month: "Jan",
          total_proposals: 45,
          accepted_proposals: 22,
          total_value: 127500,
          conversion_rate: 48.9,
          avg_deal_size: 5795,
          growth_rate: 0
        },
        {
          month: "Feb",
          total_proposals: 52,
          accepted_proposals: 28,
          total_value: 145000,
          conversion_rate: 53.8,
          avg_deal_size: 5179,
          growth_rate: 13.7
        },
        {
          month: "Mar",
          total_proposals: 48,
          accepted_proposals: 25,
          total_value: 162500,
          conversion_rate: 52.1,
          avg_deal_size: 6500,
          growth_rate: 12.1
        },
        {
          month: "Apr",
          total_proposals: 56,
          accepted_proposals: 32,
          total_value: 184000,
          conversion_rate: 57.1,
          avg_deal_size: 5750,
          growth_rate: 13.2
        },
        {
          month: "May",
          total_proposals: 64,
          accepted_proposals: 40,
          total_value: 220000,
          conversion_rate: 62.5,
          avg_deal_size: 5500,
          growth_rate: 19.6
        },
        {
          month: "Jun",
          total_proposals: 72,
          accepted_proposals: 48,
          total_value: 288000,
          conversion_rate: 66.7,
          avg_deal_size: 6000,
          growth_rate: 30.9
        }
      ];
      
      return mockData;
    }
  });
};
