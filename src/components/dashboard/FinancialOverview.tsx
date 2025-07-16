import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Download, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  revenueCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  expenseCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export const FinancialOverview = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [financialData, setFinancialData] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    monthlyData: [],
    revenueCategories: [],
    expenseCategories: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const months = [
    { value: 1, label: "Ocak" }, { value: 2, label: "Şubat" }, { value: 3, label: "Mart" },
    { value: 4, label: "Nisan" }, { value: 5, label: "Mayıs" }, { value: 6, label: "Haziran" },
    { value: 7, label: "Temmuz" }, { value: 8, label: "Ağustos" }, { value: 9, label: "Eylül" },
    { value: 10, label: "Ekim" }, { value: 11, label: "Kasım" }, { value: 12, label: "Aralık" }
  ];

  useEffect(() => {
    fetchFinancialData();
  }, [selectedYear, selectedMonth]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      // Fetch monthly financials for the year
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('monthly_financials')
        .select('*')
        .eq('year', selectedYear)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (monthlyError) throw monthlyError;

      // Process monthly data
      const monthlyTotals = months.map(month => {
        const monthData = monthlyData?.filter(d => d.month === month.value) || [];
        const revenue = monthData
          .filter(d => ['Satış Gelirleri', 'Hizmet Gelirleri', 'Diğer Gelirler'].includes(d.category))
          .reduce((sum, d) => sum + d.amount, 0);
        const expenses = monthData
          .filter(d => !['Satış Gelirleri', 'Hizmet Gelirleri', 'Diğer Gelirler'].includes(d.category))
          .reduce((sum, d) => sum + d.amount, 0);

        return {
          month: month.label.substring(0, 3),
          revenue,
          expenses,
          profit: revenue - expenses
        };
      });

      // Calculate totals
      const totalRevenue = monthlyTotals.reduce((sum, m) => sum + m.revenue, 0);
      const totalExpenses = monthlyTotals.reduce((sum, m) => sum + m.expenses, 0);
      const netProfit = totalRevenue - totalExpenses;

      // Group by categories
      const revenueCategories = monthlyData
        ?.filter(d => ['Satış Gelirleri', 'Hizmet Gelirleri', 'Diğer Gelirler'].includes(d.category))
        .reduce((acc, curr) => {
          const existing = acc.find(item => item.category === curr.category);
          if (existing) {
            existing.amount += curr.amount;
          } else {
            acc.push({ category: curr.category, amount: curr.amount, percentage: 0 });
          }
          return acc;
        }, [] as Array<{category: string; amount: number; percentage: number}>)
        .map(item => ({
          ...item,
          percentage: totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0
        })) || [];

      const expenseCategories = monthlyData
        ?.filter(d => !['Satış Gelirleri', 'Hizmet Gelirleri', 'Diğer Gelirler'].includes(d.category))
        .reduce((acc, curr) => {
          const existing = acc.find(item => item.category === curr.category);
          if (existing) {
            existing.amount += curr.amount;
          } else {
            acc.push({ category: curr.category, amount: curr.amount, percentage: 0 });
          }
          return acc;
        }, [] as Array<{category: string; amount: number; percentage: number}>)
        .map(item => ({
          ...item,
          percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0
        })) || [];

      setFinancialData({
        totalRevenue,
        totalExpenses,
        netProfit,
        monthlyData: monthlyTotals,
        revenueCategories: revenueCategories.sort((a, b) => b.amount - a.amount),
        expenseCategories: expenseCategories.sort((a, b) => b.amount - a.amount)
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Finansal veriler yüklenirken hata oluştu",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvData = [
      ['Kategori', 'Tutar', 'Yüzde'],
      ['GELİRLER', '', ''],
      ...financialData.revenueCategories.map(cat => [cat.category, cat.amount.toLocaleString('tr-TR'), `${cat.percentage.toFixed(1)}%`]),
      ['', '', ''],
      ['GİDERLER', '', ''],
      ...financialData.expenseCategories.map(cat => [cat.category, cat.amount.toLocaleString('tr-TR'), `${cat.percentage.toFixed(1)}%`])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `finansal-ozet-${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kontroller */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Finansal Genel Bakış</h1>
        <div className="flex gap-4 items-center">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025].map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            İndir
          </Button>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Gelir</p>
                <p className="text-2xl font-bold text-green-600">
                  ₺{financialData.totalRevenue.toLocaleString('tr-TR')}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Gider</p>
                <p className="text-2xl font-bold text-red-600">
                  ₺{financialData.totalExpenses.toLocaleString('tr-TR')}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Kâr</p>
                <p className={`text-2xl font-bold ${financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₺{financialData.netProfit.toLocaleString('tr-TR')}
                </p>
              </div>
              <DollarSign className={`h-8 w-8 ${financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kâr Marjı</p>
                <p className={`text-2xl font-bold ${financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {financialData.totalRevenue > 0 ? ((financialData.netProfit / financialData.totalRevenue) * 100).toFixed(1) : '0.0'}%
                </p>
              </div>
              <Target className={`h-8 w-8 ${financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ana İçerik - 2 Kolon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Aylık Trend */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Aylık Gelir & Gider Trendi ({selectedYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={financialData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => [`₺${value.toLocaleString('tr-TR')}`, '']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    name="Toplam Gelir"
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Toplam Gider"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Sağ Kolon - Kategori Detayları */}
        <div className="space-y-6">
          {/* Gelir Kategorileri */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Gelir Detayları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {financialData.revenueCategories.length > 0 ? (
                financialData.revenueCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{category.category}</span>
                        <span className="text-sm font-bold">₺{category.amount.toLocaleString('tr-TR')}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {category.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center">Gelir kaydı bulunamadı</p>
              )}
            </CardContent>
          </Card>

          {/* Gider Kategorileri */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Gider Detayları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {financialData.expenseCategories.length > 0 ? (
                financialData.expenseCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{category.category}</span>
                        <span className="text-sm font-bold">₺{category.amount.toLocaleString('tr-TR')}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {category.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center">Gider kaydı bulunamadı</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};