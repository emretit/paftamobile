
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

const mockProposalData = [
  { month: "Jan", total: 24, accepted: 15, value: 125000 },
  { month: "Feb", total: 18, accepted: 12, value: 98000 },
  { month: "Mar", total: 30, accepted: 22, value: 156000 },
  { month: "Apr", total: 22, accepted: 16, value: 134000 },
  { month: "May", total: 28, accepted: 20, value: 167000 },
  { month: "Jun", total: 32, accepted: 25, value: 189000 },
];

const mockSegmentData = [
  { name: "Enterprise", value: 45 },
  { name: "Mid-Market", value: 30 },
  { name: "SMB", value: 25 },
];

const COLORS = ["#000000", "#666666", "#999999"];

const SalesPerformance = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Proposals & Success Rate */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Aylık Teklifler ve Başarı Oranı</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockProposalData}>
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
            <LineChart data={mockProposalData}>
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

      {/* Customer Segment Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Müşteri Segment Dağılımı</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockSegmentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {mockSegmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Success Rate by Sales Rep */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Satış Temsilcisi Başarı Oranları</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: "Ahmet Y.", rate: 75 },
                { name: "Zeynep K.", rate: 82 },
                { name: "Mehmet A.", rate: 68 },
                { name: "Ayşe B.", rate: 71 },
              ]}
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
                label={{ position: "right", formatter: (value) => `${value}%` }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default SalesPerformance;
