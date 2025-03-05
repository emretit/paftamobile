
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProposalCount {
  status: string;
  count: number;
  label: string;
  color: string;
}

interface ProposalStatusCount {
  status: string;
  count: number;
}

const statusLabels: Record<string, string> = {
  draft: "Taslak",
  new: "Yeni",
  sent: "Gönderildi",
  review: "İncelemede",
  negotiation: "Görüşme",
  accepted: "Kabul Edildi",
  rejected: "Reddedildi",
  expired: "Süresi Doldu"
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  new: "bg-blue-500",
  sent: "bg-amber-500",
  review: "bg-purple-500",
  negotiation: "bg-indigo-500",
  accepted: "bg-green-500",
  rejected: "bg-red-500",
  expired: "bg-stone-500"
};

const ProposalsSummary = () => {
  const [proposalStats, setProposalStats] = useState<ProposalCount[]>([]);
  const [totalProposals, setTotalProposals] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProposalStats = async () => {
      try {
        setLoading(true);
        
        // Get total proposals count
        const { count: totalCount, error: totalError } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true });
          
        if (totalError) throw totalError;
        
        // Get proposals by status using the database function
        const { data, error } = await supabase
          .rpc('get_proposal_counts_by_status') as { data: ProposalStatusCount[] | null, error: Error | null };
          
        if (error) {
          // Fallback if the RPC function doesn't work
          const { data: rawData, error: queryError } = await supabase
            .from('proposals')
            .select('status');
            
          if (queryError) throw queryError;
          
          // Process the data manually
          const statusCounts: Record<string, number> = {};
          rawData.forEach(proposal => {
            statusCounts[proposal.status] = (statusCounts[proposal.status] || 0) + 1;
          });
          
          const formattedData: ProposalCount[] = Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count,
            label: statusLabels[status] || status,
            color: statusColors[status] || "bg-gray-500"
          }));
          
          setProposalStats(formattedData);
        } else {
          // If RPC function worked
          const formattedData: ProposalCount[] = (data as ProposalStatusCount[]).map((item: ProposalStatusCount) => ({
            status: item.status,
            count: Number(item.count),
            label: statusLabels[item.status] || item.status,
            color: statusColors[item.status] || "bg-gray-500"
          }));
          
          setProposalStats(formattedData);
        }
        
        setTotalProposals(totalCount || 0);
      } catch (error) {
        console.error('Error fetching proposal stats:', error);
        toast.error('Teklif bilgileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProposalStats();
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
  
  // If no proposals exist yet
  if (totalProposals === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground font-medium">Henüz teklif bulunmuyor</p>
        <p className="text-sm mt-2 text-gray-500">Teklifler sayfasından yeni teklif ekleyebilirsiniz</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
        <span className="text-lg font-semibold">{totalProposals}</span>
        <span className="text-sm text-muted-foreground">Toplam Teklif</span>
      </div>
      
      <div className="space-y-4">
        {proposalStats.map((stat) => (
          <div key={stat.status} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{stat.label}</span>
              <span className="font-semibold">{stat.count}</span>
            </div>
            <Progress 
              value={(stat.count / totalProposals) * 100} 
              className="h-2 w-full"
              indicatorClassName={stat.color}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProposalsSummary;
