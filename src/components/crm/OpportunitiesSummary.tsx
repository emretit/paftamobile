
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OpportunityCount {
  status: string;
  count: number;
  label: string;
  color: string;
}

interface OpportunityStatusCount {
  status: string;
  count: number;
}

const statusLabels: Record<string, string> = {
  new: "Yeni",
  meeting_visit: "Görüşme ve Ziyaret",
  proposal: "Teklif",
  qualified: "Nitelikli",
  negotiation: "Müzakere",
  won: "Kazanıldı",
  lost: "Kaybedildi"
};

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  meeting_visit: "bg-purple-500",
  proposal: "bg-orange-500",
  qualified: "bg-yellow-500",
  negotiation: "bg-indigo-500",
  won: "bg-green-500",
  lost: "bg-red-500"
};

const OpportunitiesSummary = () => {
  const [opportunityStats, setOpportunityStats] = useState<OpportunityCount[]>([]);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchOpportunityStats = async () => {
      try {
        setLoading(true);
        
        // Get all opportunities
        const { data: opportunities, error } = await supabase
          .from('opportunities')
          .select('status');
        
        if (error) throw error;
        
        const totalCount = opportunities?.length || 0;
        
        if (opportunities) {
          // Count opportunities by status
          const statusCounts: Record<string, number> = {};
          opportunities.forEach(opportunity => {
            statusCounts[opportunity.status] = (statusCounts[opportunity.status] || 0) + 1;
          });
          
          const formattedData: OpportunityCount[] = Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count,
            label: statusLabels[status] || status,
            color: statusColors[status] || "bg-gray-500"
          }));
          
          setOpportunityStats(formattedData);
          setTotalOpportunities(totalCount);
        }
      } catch (error) {
        console.error('Error fetching opportunity stats:', error);
        toast.error('Fırsat bilgileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOpportunityStats();
  }, []);
  
  if (loading) {
    return (
      <div className="space-y-4 py-6">
        <div className="h-8 bg-gradient-to-r from-emerald-100 to-emerald-50 animate-pulse rounded-lg"></div>
        <div className="space-y-3">
          <div className="h-6 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-md"></div>
          <div className="h-4 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-md"></div>
          <div className="h-6 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-md"></div>
        </div>
      </div>
    );
  }
  
  // If no opportunities exist yet
  if (totalOpportunities === 0) {
    return (
      <div className="text-center py-8 bg-gradient-to-br from-emerald-50/30 to-emerald-100/20 rounded-lg border border-emerald-200/30">
        <BarChart3 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">Henüz fırsat bulunmuyor</p>
        <p className="text-sm mt-2 text-emerald-600/70">İlk fırsatınızı oluşturun</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-4 rounded-lg border border-emerald-200/50 shadow-sm">
        <span className="text-2xl font-bold text-emerald-800">{totalOpportunities}</span>
        <span className="text-sm font-medium text-emerald-600">Toplam Fırsat</span>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center">
          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
          Durum Dağılımı
        </h4>
        {opportunityStats.map((stat) => (
          <div key={stat.status} className="space-y-2">
            <div className="flex justify-between text-sm p-2 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-lg border border-emerald-200/30">
              <span className="font-medium">{stat.label}</span>
              <span className="font-bold text-emerald-700">{stat.count}</span>
            </div>
            <Progress 
              value={(stat.count / totalOpportunities) * 100} 
              className="h-3 w-full bg-emerald-100/50 rounded-full"
              indicatorClassName={`${stat.color} rounded-full transition-all duration-500`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpportunitiesSummary;
