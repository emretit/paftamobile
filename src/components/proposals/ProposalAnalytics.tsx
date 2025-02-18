
import { Card } from "@/components/ui/card";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Download, Users, TrendingUp, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import { useSalesPerformance } from "@/hooks/useSalesPerformance";
import { useProposals } from "@/hooks/useProposals";
import { toast } from "sonner";

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b'];

export const ProposalAnalytics = () => {
  const { data: salesPerformance } = useSalesPerformance();
  const { data: proposals } = useProposals();

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

    const statusData = [
      { name: 'Bekleyen', value: pendingProposals },
      { name: 'Kabul Edilen', value: acceptedProposals },
      { name: 'Reddedilen', value: rejectedProposals },
    ];

    return {
      totalProposals,
      acceptanceRate,
      averageValue,
      totalValue,
      statusData,
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Teklif Durumu Dağılımı</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} Teklif`, '']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {metrics.statusData.map((entry, index) => (
                <div key={entry.name} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Satış Temsilcisi Performansı</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="employee_name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem',
                  }}
                />
                <Bar 
                  dataKey="success_rate" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Başarı Oranı (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
