
import { useProposals } from "@/hooks/useProposals";
import { FileText, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export const ProposalAnalytics = () => {
  const { data } = useProposals();

  // Calculate metrics
  const calculateMetrics = () => {
    if (!data) return null;

    const totalProposals = data.length;
    const acceptedProposals = data.filter(p => p.status === 'approved' || p.status === 'accepted').length;
    const totalValue = data.reduce((sum, p) => sum + p.total_value, 0);
    const averageValue = totalProposals > 0 ? totalValue / totalProposals : 0;
    const acceptanceRate = totalProposals > 0 ? (acceptedProposals / totalProposals) * 100 : 0;

    return {
      totalProposals,
      acceptanceRate,
      averageValue,
      totalValue,
    };
  };

  const metrics = calculateMetrics() || { totalProposals: 0, acceptanceRate: 0, averageValue: 0, totalValue: 0 };

  const handleDownloadReport = (format: 'pdf' | 'excel') => {
    toast.info(`${format.toUpperCase()} raporu yakında indirilebilecek`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Analytics Cards */}
      <div className="bg-white rounded-lg border p-6 flex flex-col">
        <div className="flex items-center mb-2">
          <FileText className="h-6 w-6 text-blue-600 mr-2" />
        </div>
        <div className="text-sm text-gray-600">Toplam Teklif</div>
        <div className="text-3xl font-bold mt-1">{metrics.totalProposals}</div>
      </div>
      
      <div className="bg-white rounded-lg border p-6 flex flex-col">
        <div className="flex items-center mb-2">
          <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
        </div>
        <div className="text-sm text-gray-600">Kabul Oranı</div>
        <div className="text-3xl font-bold mt-1">{metrics.acceptanceRate.toFixed(1)}%</div>
      </div>
      
      <div className="bg-white rounded-lg border p-6 flex flex-col">
        <div className="flex items-center mb-2">
          <DollarSign className="h-6 w-6 text-amber-600 mr-2" />
        </div>
        <div className="text-sm text-gray-600">Ortalama Teklif Tutarı</div>
        <div className="text-3xl font-bold mt-1">
          {new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(metrics.averageValue)}
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-6 flex flex-col">
        <div className="flex items-center mb-2">
          <DollarSign className="h-6 w-6 text-purple-600 mr-2" />
        </div>
        <div className="text-sm text-gray-600">Toplam Potansiyel Gelir</div>
        <div className="text-3xl font-bold mt-1">
          {new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(metrics.totalValue)}
        </div>
      </div>

      {/* Download buttons - hiding them as secondary feature */}
      <div className="hidden md:flex justify-end gap-2 col-span-4">
        <Button variant="outline" size="sm" onClick={() => handleDownloadReport('pdf')}>
          <Download className="h-4 w-4 mr-2" />
          PDF İndir
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleDownloadReport('excel')}>
          <Download className="h-4 w-4 mr-2" />
          Excel İndir
        </Button>
      </div>
    </div>
  );
};
