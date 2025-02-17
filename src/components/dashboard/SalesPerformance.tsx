
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useSalesPerformance } from "@/hooks/useSalesPerformance";

const COLORS = ["#000000", "#666666", "#999999"];

const SalesPerformance = () => {
  const { data: salesData, isLoading } = useSalesPerformance();

  const monthlyData = useMemo(() => {
    if (!salesData) return [];
    return salesData.map(item => ({
      month: format(new Date(item.month), 'MMM', { locale: tr }),
      total: item.total_proposals,
      accepted: item.accepted_proposals,
      value: item.total_value
    }));
  }, [salesData]);

  const salesRepData = useMemo(() => {
    if (!salesData) return [];
    return Object.values(
      salesData.reduce<{ [key: string]: { name: string; rate: number; total: number } }>(
        (acc, item) => {
          if (!acc[item.employee_id]) {
            acc[item.employee_id] = {
              name: item.employee_name,
              rate: 0,
              total: 0
            };
          }
          acc[item.employee_id].rate = item.success_rate;
          acc[item.employee_id].total += item.total_value;
          return acc;
        },
        {}
      )
    ).sort((a, b) => b.rate - a.rate);
  }, [salesData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="h-[300px] animate-pulse bg-gray-100 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Proposals & Success Rate */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Aylık Teklifler ve Başarı Oranı</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="total"
                fill="#000000"
                name="Toplam Teklif"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="left"
                dataKey="accepted"
                fill="#666666"
                name="Kabul Edilen"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Revenue Growth */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Gelir Büyümesi</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#000000"
                strokeWidth={2}
                dot={{ fill: "#000000" }}
                name="Gelir"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Success Rate by Sales Rep */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Satış Temsilcisi Başarı Oranları</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={salesRepData}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Bar
                dataKey="rate"
                fill="#000000"
                radius={[0, 4, 4, 0]}
                label={{ position: "right", formatter: (value: number) => `${value.toFixed(1)}%` }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Sales Rep Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Satış Temsilcisi Performansı</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={salesRepData}
                dataKey="total"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {salesRepData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default SalesPerformance;
