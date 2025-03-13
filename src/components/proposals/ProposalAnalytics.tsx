
import { Download, FileText, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import { useProposals } from "@/hooks/useProposals";
import { toast } from "sonner";

export const ProposalAnalytics = () => {
  const { proposals } = useProposals();

  // Calculate metrics
  const calculateMetrics = () => {
    if (!proposals) return null;

    const totalProposals = proposals.length;
    const acceptedProposals = proposals.filter(p => p.status === 'accepted').length;
    const rejectedProposals = proposals.filter(p => p.status === 'rejected').length;
    const pendingProposals = totalProposals - acceptedProposals - rejectedProposals;

    const totalValue = proposals.reduce((sum, p) => sum + p.total_value, 0);
    const averageValue = totalValue / totalProposals || 0;
    const acceptanceRate = (acceptedProposals / totalProposals) * 100 || 0;

    return {
      totalProposals,
      acceptanceRate,
      averageValue,
      totalValue,
    };
  };

  const metrics = calculateMetrics();

  const handleDownloadReport = (format: 'pdf' | 'excel') => {
    // This will be implemented with proper export functionality
    toast.info(`${format.toUpperCase()} raporu yakında indirilebilecek`);
  };

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Teklif Analizi</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => handleDownloadReport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            PDF İndir
          </Button>
          <Button variant="outline" onClick={() => handleDownloadReport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Excel İndir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Toplam Teklif"
          value={metrics.totalProposals.toString()}
          icon={<FileText className="h-6 w-6" />}
        />
        <DashboardCard
          title="Kabul Oranı"
          value={`${metrics.acceptanceRate.toFixed(1)}%`}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <DashboardCard
          title="Ortalama Teklif Tutarı"
          value={new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
          }).format(metrics.averageValue)}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <DashboardCard
          title="Toplam Potansiyel Gelir"
          value={new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
          }).format(metrics.totalValue)}
          icon={<DollarSign className="h-6 w-6" />}
        />
      </div>
    </div>
  );
};
