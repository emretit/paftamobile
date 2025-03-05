
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DealCount {
  status: string;
  count: number;
  label: string;
  color: string;
}

interface DealStatusCount {
  status: string;
  count: number;
}

const statusLabels: Record<string, string> = {
  new: "Yeni",
  negotiation: "Görüşme",
  follow_up: "Takip",
  won: "Kazanıldı",
  lost: "Kaybedildi"
};

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  negotiation: "bg-amber-500",
  follow_up: "bg-purple-500",
  won: "bg-green-500",
  lost: "bg-red-500"
};

const OpportunitiesSummary = () => {
  const [dealStats, setDealStats] = useState<DealCount[]>([]);
  const [totalDeals, setTotalDeals] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDealStats = async () => {
      try {
        setLoading(true);
        
        // Get total deals count
        const { count: totalCount, error: totalError } = await supabase
          .from('deals')
          .select('*', { count: 'exact', head: true });
          
        if (totalError) throw totalError;
        
        // Get deals by status using the database function
        const { data, error } = await supabase
          .rpc('get_deal_counts_by_status') as { data: DealStatusCount[] | null, error: Error | null };
          
        if (error) {
          // Fallback if the RPC function doesn't work
          const { data: rawData, error: queryError } = await supabase
            .from('deals')
            .select('status');
            
          if (queryError) throw queryError;
          
          // Process the data manually
          const statusCounts: Record<string, number> = {};
          rawData.forEach(deal => {
            statusCounts[deal.status] = (statusCounts[deal.status] || 0) + 1;
          });
          
          const formattedData: DealCount[] = Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count,
            label: statusLabels[status] || status,
            color: statusColors[status] || "bg-gray-500"
          }));
          
          setDealStats(formattedData);
        } else {
          // If RPC function worked
          const formattedData: DealCount[] = (data as DealStatusCount[]).map((item: DealStatusCount) => ({
            status: item.status,
            count: Number(item.count),
            label: statusLabels[item.status] || item.status,
            color: statusColors[item.status] || "bg-gray-500"
          }));
          
          setDealStats(formattedData);
        }
        
        setTotalDeals(totalCount || 0);
      } catch (error) {
        console.error('Error fetching deal stats:', error);
        toast.error('Fırsat bilgileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDealStats();
  }, []);
  
  if (loading) {
    return (
      <div className="space-y-3 py-6">
        <div className="h-6 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-20 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-6 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }
  
  // If no deals exist yet
  if (totalDeals === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground font-medium">Henüz fırsat bulunmuyor</p>
        <p className="text-sm mt-2 text-gray-500">Fırsatlar sayfasından yeni fırsat ekleyebilirsiniz</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
        <span className="text-lg font-semibold">{totalDeals}</span>
        <span className="text-sm text-muted-foreground">Toplam Fırsat</span>
      </div>
      
      <div className="space-y-4">
        {dealStats.map((stat) => (
          <div key={stat.status} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{stat.label}</span>
              <span className="font-semibold">{stat.count}</span>
            </div>
            <Progress 
              value={(stat.count / totalDeals) * 100} 
              className="h-2 w-full"
              indicatorClassName={stat.color}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpportunitiesSummary;
