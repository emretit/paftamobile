
import { Card } from "@/components/ui/card";
import { Customer } from "@/types/customer";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface CustomerSummaryChartsProps {
  customers: Customer[] | undefined;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const CustomerSummaryCharts = ({ customers = [] }: CustomerSummaryChartsProps) => {
  if (!customers.length) {
    return null;
  }

  // Calculate type distribution
  const typeDistribution = customers.reduce((acc: Record<string, number>, customer) => {
    const type = customer.type || "belirsiz";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(typeDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate status distribution
  const statusDistribution = customers.reduce((acc: Record<string, number>, customer) => {
    const status = customer.status || "belirsiz";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate total customer balance
  const totalBalance = customers.reduce((sum, customer) => sum + (customer.balance || 0), 0);
  
  // Get top 5 customers by balance
  const topCustomers = [...customers]
    .sort((a, b) => (b.balance || 0) - (a.balance || 0))
    .slice(0, 5)
    .map(customer => ({
      name: customer.name,
      balance: customer.balance || 0
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-4">Müşteri Tipi Dağılımı</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} müşteri`, 'Adet']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium mb-4">Müşteri Durumu Dağılımı</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} müşteri`, 'Adet']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium mb-4">En Yüksek Bakiyeli Müşteriler</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCustomers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
              <Tooltip 
                formatter={(value) => [
                  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(value)),
                  'Bakiye'
                ]} 
              />
              <Bar dataKey="balance" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default CustomerSummaryCharts;
