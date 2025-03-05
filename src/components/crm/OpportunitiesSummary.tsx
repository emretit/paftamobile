
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
        
        // Get deals by status
        const { data, error } = await supabase
          .from('deals')
          .select('status, count(*)')
          .groupBy('status');
          
        if (error) throw error;
        
        const formattedData: DealCount[] = data.map(item => ({
          status: item.status,
          count: item.count,
          label: statusLabels[item.status] || item.status,
          color: statusColors[item.status] || "bg-gray-500"
        }));
        
        setDealStats(formattedData);
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
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-20 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-6 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }
  
  // If no deals exist yet
  if (totalDeals === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Henüz fırsat bulunmuyor</p>
        <p className="text-sm mt-2">Fırsatlar sayfasından yeni fırsat ekleyebilirsiniz</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">{totalDeals}</span>
        <span className="text-sm text-muted-foreground">Toplam Fırsat</span>
      </div>
      
      <div className="space-y-3">
        {dealStats.map((stat) => (
          <div key={stat.status} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{stat.label}</span>
              <span className="font-medium">{stat.count}</span>
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
