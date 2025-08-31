
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
  
  const topStats = opportunityStats.slice(0, 3);
  const wonCount = opportunityStats.find(s => s.status === 'won')?.count || 0;
  const totalValue = totalOpportunities * 1000; // Mock value calculation

  return (
    <div className="space-y-4">
      {/* Main Metric */}
      <div className="text-center">
        <div className="text-3xl font-bold text-emerald-900 mb-1">{totalOpportunities}</div>
        <div className="text-sm text-emerald-700/70 font-medium">Toplam Fırsat</div>
      </div>
      
      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {topStats.map((stat, index) => (
          <div key={stat.status} className="bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-emerald-200/30">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
              <span className="text-xs font-medium text-emerald-800 truncate">{stat.label}</span>
            </div>
            <div className="text-lg font-bold text-emerald-900">{stat.count}</div>
          </div>
        ))}
        
        {topStats.length < 4 && (
          <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-emerald-200/30">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-800">Kazanılan</span>
            </div>
            <div className="text-lg font-bold text-emerald-900">{wonCount}</div>
          </div>
        )}
      </div>
      
      {/* Value Indicator */}
      <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-emerald-200/30">
        <div className="flex justify-between items-center text-xs text-emerald-800 mb-2">
          <span>Tahmini Değer</span>
          <span className="font-bold">₺{totalValue.toLocaleString()}</span>
        </div>
        <div className="text-xs text-emerald-700/70">
          Ortalama fırsat değeri: ₺{totalOpportunities > 0 ? (totalValue / totalOpportunities).toLocaleString() : 0}
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesSummary;
