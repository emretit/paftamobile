
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { FileText } from "lucide-react";
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
      <div className="space-y-4 py-6">
        <div className="h-8 bg-gradient-to-r from-purple-100 to-purple-50 animate-pulse rounded-lg"></div>
        <div className="space-y-3">
          <div className="h-6 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-md"></div>
          <div className="h-4 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-md"></div>
          <div className="h-6 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-md"></div>
        </div>
      </div>
    );
  }
  
  // If no proposals exist yet
  if (totalProposals === 0) {
    return (
      <div className="text-center py-8 bg-gradient-to-br from-purple-50/30 to-purple-100/20 rounded-lg border border-purple-200/30">
        <FileText className="h-12 w-12 text-purple-400 mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">Henüz teklif bulunmuyor</p>
        <p className="text-sm mt-2 text-purple-600/70">İlk teklifinizi oluşturun</p>
      </div>
    );
  }
  
  const topStats = proposalStats.slice(0, 3);
  const acceptedCount = proposalStats.find(s => s.status === 'accepted')?.count || 0;
  const sentCount = proposalStats.find(s => s.status === 'sent')?.count || 0;

  return (
    <div className="space-y-4">
      {/* Main Metric */}
      <div className="text-center">
        <div className="text-3xl font-bold text-purple-900 mb-1">{totalProposals}</div>
        <div className="text-sm text-purple-700/70 font-medium">Toplam Teklif</div>
      </div>
      
      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-purple-200/30">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-xs font-medium text-purple-800">Gönderildi</span>
          </div>
          <div className="text-lg font-bold text-purple-900">{sentCount}</div>
        </div>
        
        <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-purple-200/30">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium text-purple-800">Kabul Edildi</span>
          </div>
          <div className="text-lg font-bold text-purple-900">{acceptedCount}</div>
        </div>
        
        {topStats.slice(0, 2).map((stat) => (
          <div key={stat.status} className="bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-purple-200/30">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
              <span className="text-xs font-medium text-purple-800 truncate">{stat.label}</span>
            </div>
            <div className="text-lg font-bold text-purple-900">{stat.count}</div>
          </div>
        ))}
      </div>
      
      {/* Conversion Rate */}
      <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-purple-200/30">
        <div className="flex justify-between items-center text-xs text-purple-800 mb-2">
          <span>Kabul Oranı</span>
          <span className="font-bold">{totalProposals > 0 ? Math.round((acceptedCount / totalProposals) * 100) : 0}%</span>
        </div>
        <div className="w-full bg-purple-200/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${totalProposals > 0 ? (acceptedCount / totalProposals) * 100 : 0}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProposalsSummary;
