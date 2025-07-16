import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Calculator,
  Download,
  Target,
  Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { useOpexMatrix } from "@/hooks/useOpexMatrix";
import { useInvoiceAnalysis } from "@/hooks/useInvoiceAnalysis";

const FinancialOverview = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { data: opexData } = useOpexMatrix();
  const { data: invoiceData } = useInvoiceAnalysis(selectedYear);

  const MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const COLORS = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#6366F1',
    secondary: '#8B5CF6'
  };

  const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6'];

  // Calculate monthly financial data
  const getMonthlyData = () => {
    return MONTHS.map((month, index) => {
      const monthNum = index + 1;
      
      // Get invoice data for this month
      const invoiceMonth = invoiceData.find(d => d.month === monthNum);
      
      // Calculate OPEX for this month
      const monthlyOpex = opexData
        .filter(item => item.month === monthNum && item.year === selectedYear)
        .reduce((sum, item) => sum + item.amount, 0);

      const revenue = invoiceMonth?.sales_invoice || 0;
      const purchases = invoiceMonth?.purchase_invoice || 0;
      const grossProfit = revenue - purchases;
      const netProfit = grossProfit - monthlyOpex;
      const profitMargin = revenue > 0 ? ((netProfit / revenue) * 100) : 0;

      return {
        month,
        revenue,
        purchases,
        grossProfit,
        opex: monthlyOpex,
        netProfit,
        profitMargin,
        vatDifference: invoiceMonth?.vat_difference || 0
      };
    });
  };

  const monthlyData = getMonthlyData();

  // Calculate summary metrics
  const totalRevenue = monthlyData.reduce((sum, item) => sum + item.revenue, 0);
  const totalPurchases = monthlyData.reduce((sum, item) => sum + item.purchases, 0);
  const totalOpex = monthlyData.reduce((sum, item) => sum + item.opex, 0);
  const totalGrossProfit = totalRevenue - totalPurchases;
  const totalNetProfit = totalGrossProfit - totalOpex;
  const overallMargin = totalRevenue > 0 ? ((totalNetProfit / totalRevenue) * 100) : 0;

  // OPEX breakdown data
  const opexBreakdown = opexData
    .filter(item => item.year === selectedYear)
    .reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = 0;
      }
      acc[item.category] += item.amount;
      return acc;
    }, {} as Record<string, number>);

  const opexPieData = Object.entries(opexBreakdown).map(([name, value]) => ({
    name,
    value
  }));

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PieChart className="h-6 w-6" />
            Finansal Genel Bakış
          </h2>
          <p className="text-gray-600">Kapsamlı finansal analiz ve performans özeti</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Toplam Ciro</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-blue-600 mt-1">Bu yıl</p>
              </div>
              <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Brüt Kar</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(totalGrossProfit)}</p>
                <p className="text-xs text-green-600 mt-1">
                  {formatPercentage((totalGrossProfit / totalRevenue) * 100)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Net Kar</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(totalNetProfit)}</p>
                <p className="text-xs text-purple-600 mt-1">
                  {formatPercentage(overallMargin)}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-200 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Toplam OPEX</p>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(totalOpex)}</p>
                <p className="text-xs text-orange-600 mt-1">
                  {formatPercentage((totalOpex / totalRevenue) * 100)}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-200 rounded-full flex items-center justify-center">
                <Calculator className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="breakdown" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="breakdown">Gider Dağılımı</TabsTrigger>
          <TabsTrigger value="profitability">Karlılık</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">OPEX Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={opexPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {opexPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aylık Gider Analizi</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="purchases" fill={COLORS.danger} name="Alışlar" />
                    <Bar dataKey="opex" fill={COLORS.warning} name="OPEX" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aylık Karlılık</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="grossProfit" fill={COLORS.success} name="Brüt Kar" />
                    <Bar dataKey="netProfit" fill={COLORS.primary} name="Net Kar" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Finansal Özet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Toplam Ciro</span>
                    <span className="font-bold">{formatCurrency(totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Toplam Alışlar</span>
                    <span className="font-bold text-red-600">{formatCurrency(totalPurchases)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Brüt Kar</span>
                    <span className="font-bold text-green-600">{formatCurrency(totalGrossProfit)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Toplam OPEX</span>
                    <span className="font-bold text-orange-600">{formatCurrency(totalOpex)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Net Kar</span>
                    <span className="font-bold text-purple-600">{formatCurrency(totalNetProfit)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium">Kar Marjı</span>
                    <Badge variant={overallMargin > 0 ? "default" : "destructive"}>
                      {formatPercentage(overallMargin)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed Monthly Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detaylı Aylık Analiz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-3 text-left font-medium">Ay</th>
                  <th className="border p-3 text-right font-medium">Ciro</th>
                  <th className="border p-3 text-right font-medium">Alışlar</th>
                  <th className="border p-3 text-right font-medium">Brüt Kar</th>
                  <th className="border p-3 text-right font-medium">OPEX</th>
                  <th className="border p-3 text-right font-medium">Net Kar</th>
                  <th className="border p-3 text-right font-medium">Kar Marjı</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-3 font-medium">{row.month}</td>
                    <td className="border p-3 text-right">{formatCurrency(row.revenue)}</td>
                    <td className="border p-3 text-right text-red-600">{formatCurrency(row.purchases)}</td>
                    <td className="border p-3 text-right text-green-600">{formatCurrency(row.grossProfit)}</td>
                    <td className="border p-3 text-right text-orange-600">{formatCurrency(row.opex)}</td>
                    <td className="border p-3 text-right">
                      <Badge variant={row.netProfit > 0 ? "default" : "destructive"}>
                        {formatCurrency(row.netProfit)}
                      </Badge>
                    </td>
                    <td className="border p-3 text-right">
                      <Badge variant={row.profitMargin > 0 ? "default" : "destructive"}>
                        {formatPercentage(row.profitMargin)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialOverview;