
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { mockCrmService } from "@/services/mockCrmService";

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
  first_contact: "İlk Görüşme",
  site_visit: "Ziyaret Yapıldı",
  preparing_proposal: "Teklif Hazırlanıyor",
  proposal_sent: "Teklif Gönderildi",
  accepted: "Kazanıldı",
  lost: "Kaybedildi"
};

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  first_contact: "bg-purple-500",
  site_visit: "bg-yellow-500",
  preparing_proposal: "bg-orange-500",
  proposal_sent: "bg-indigo-500",
  accepted: "bg-green-500",
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
        const { data: opportunities } = await mockCrmService.getOpportunities();
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
      <div className="space-y-3 py-6">
        <div className="h-6 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-20 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-6 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }
  
  // If no opportunities exist yet
  if (totalOpportunities === 0) {
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
        <span className="text-lg font-semibold">{totalOpportunities}</span>
        <span className="text-sm text-muted-foreground">Toplam Fırsat</span>
      </div>
      
      <div className="space-y-4">
        {opportunityStats.map((stat) => (
          <div key={stat.status} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{stat.label}</span>
              <span className="font-semibold">{stat.count}</span>
            </div>
            <Progress 
              value={(stat.count / totalOpportunities) * 100} 
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
