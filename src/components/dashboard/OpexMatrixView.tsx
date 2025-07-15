import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Download, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { useOpexMatrix } from "@/hooks/useOpexMatrix";
import { supabase } from "@/integrations/supabase/client";

// OPEX categories for Turkish companies
const OPEX_CATEGORIES = [
  { key: 'rent', label: 'Kira', subcategories: ['Ofis Kira', 'Depo Kira', 'Diğer'] },
  { key: 'utilities', label: 'Faturalar', subcategories: ['Elektrik', 'Su', 'Doğalgaz', 'İnternet', 'Telefon'] },
  { key: 'office', label: 'Ofis Giderleri', subcategories: ['Ofis Malzemeleri', 'Temizlik', 'Bakım'] },
  { key: 'personnel', label: 'Personel', subcategories: ['Maaş', 'Sigorta', 'Eğitim', 'İkramiye'] },
  { key: 'transportation', label: 'Ulaşım', subcategories: ['Araç/Yakıt', 'Yol', 'Kargo'] },
  { key: 'marketing', label: 'Pazarlama', subcategories: ['Reklam', 'Sosyal Medya', 'Etkinlik'] },
  { key: 'professional', label: 'Profesyonel Hizmetler', subcategories: ['Danışmanlık', 'Muhasebe', 'Hukuk'] },
  { key: 'taxes', label: 'Vergiler', subcategories: ['KDV', 'Gelir Vergisi', 'Damga Vergisi'] },
  { key: 'finance', label: 'Finansal', subcategories: ['Banka Masrafları', 'Faiz', 'Sigorta'] },
  { key: 'other', label: 'Diğer', subcategories: ['Çeşitli', 'Beklenmeyen'] },
];

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const OpexMatrixView = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editingCell, setEditingCell] = useState<{ category: string; subcategory: string; month: number } | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  const { data, loading, upsertOpexMatrix, refetch } = useOpexMatrix();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refetch(selectedYear);
    }
  }, [selectedYear, refetch, isAuthenticated]);

  const getOpexValue = (category: string, subcategory: string, month: number) => {
    const opex = data.find(o => 
      o.category === category && 
      o.subcategory === subcategory && 
      o.month === month && 
      o.year === selectedYear
    );
    return opex?.amount || 0;
  };

  const getTotalByCategory = (category: string) => {
    return OPEX_CATEGORIES.find(c => c.key === category)?.subcategories.reduce((sum, subcategory) => {
      return sum + Array.from({ length: 12 }, (_, i) => getOpexValue(category, subcategory, i + 1))
        .reduce((monthSum, value) => monthSum + value, 0);
    }, 0) || 0;
  };

  const getTotalByMonth = (month: number) => {
    return OPEX_CATEGORIES.reduce((sum, category) => {
      return sum + category.subcategories.reduce((catSum, subcategory) => {
        return catSum + getOpexValue(category.key, subcategory, month);
      }, 0);
    }, 0);
  };

  const getGrandTotal = () => {
    return Array.from({ length: 12 }, (_, i) => getTotalByMonth(i + 1))
      .reduce((sum, monthTotal) => sum + monthTotal, 0);
  };

  const handleCellEdit = async (category: string, subcategory: string, month: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    try {
      await upsertOpexMatrix(selectedYear, month, category, subcategory, numValue);
      setEditingCell(null);
      setTempValue('');
    } catch (error) {
      console.error('Error updating opex value:', error);
    }
  };

  const handleCellClick = (category: string, subcategory: string, month: number) => {
    setEditingCell({ category, subcategory, month });
    setTempValue(getOpexValue(category, subcategory, month).toString());
  };

  const handleKeyPress = (e: React.KeyboardEvent, category: string, subcategory: string, month: number) => {
    if (e.key === 'Enter') {
      handleCellEdit(category, subcategory, month, tempValue);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setTempValue('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthlyChartData = () => {
    return MONTHS.map((month, index) => ({
      month: month.substring(0, 3),
      amount: getTotalByMonth(index + 1),
    }));
  };

  const getCategoryChartData = () => {
    return OPEX_CATEGORIES.map(category => ({
      category: category.label,
      amount: getTotalByCategory(category.key),
    }));
  };

  const exportToExcel = () => {
    const headers = ['Kategori', 'Alt Kategori', ...MONTHS, 'Toplam'];
    const rows = [];

    OPEX_CATEGORIES.forEach(category => {
      category.subcategories.forEach(subcategory => {
        const monthlyValues = MONTHS.map((_, index) => getOpexValue(category.key, subcategory, index + 1));
        const total = monthlyValues.reduce((sum, val) => sum + val, 0);
        
        rows.push([
          category.label,
          subcategory,
          ...monthlyValues,
          total
        ]);
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `opex_matrix_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-64">Kimlik doğrulaması kontrol ediliyor...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-64">
        <Card className="p-6">
          <CardContent className="text-center">
            <h3 className="text-lg font-semibold mb-2">Kimlik Doğrulaması Gerekli</h3>
            <p className="text-gray-600">OPEX verilerini görüntülemek için giriş yapmanız gerekiyor.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">OPEX verileri yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">OPEX Matrix</h1>
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
        </div>
        <Button onClick={exportToExcel} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Excel'e Aktar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam OPEX</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getGrandTotal())}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Yüksek Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {OPEX_CATEGORIES.reduce((max, cat) => 
                getTotalByCategory(cat.key) > getTotalByCategory(max.key) ? cat : max
              ).label}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Yüksek Ay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {MONTHS[Array.from({ length: 12 }, (_, i) => getTotalByMonth(i + 1))
                .reduce((maxIndex, current, index, arr) => 
                  current > arr[maxIndex] ? index : maxIndex, 0)]}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aylık Ortalama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getGrandTotal() / 12)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Aylık OPEX Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getMonthlyChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kategorilere Göre Dağılım</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getCategoryChartData()} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={100} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle>OPEX Matrix - {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Kategori</TableHead>
                  <TableHead className="w-40">Alt Kategori</TableHead>
                  {MONTHS.map((month, index) => (
                    <TableHead key={index} className="text-center min-w-24">
                      {month.substring(0, 3)}
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-bold">Toplam</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {OPEX_CATEGORIES.map(category => (
                  category.subcategories.map((subcategory, subIndex) => (
                    <TableRow key={`${category.key}-${subIndex}`}>
                      {subIndex === 0 && (
                        <TableCell rowSpan={category.subcategories.length} className="font-medium bg-gray-50">
                          {category.label}
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{subcategory}</TableCell>
                      {MONTHS.map((_, monthIndex) => {
                        const month = monthIndex + 1;
                        const value = getOpexValue(category.key, subcategory, month);
                        const isEditing = editingCell?.category === category.key && 
                                         editingCell?.subcategory === subcategory && 
                                         editingCell?.month === month;
                        
                        return (
                          <TableCell key={monthIndex} className="text-center">
                            {isEditing ? (
                              <Input
                                type="number"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onKeyDown={(e) => handleKeyPress(e, category.key, subcategory, month)}
                                onBlur={() => handleCellEdit(category.key, subcategory, month, tempValue)}
                                className="w-20 text-center"
                                autoFocus
                              />
                            ) : (
                              <div
                                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                                onClick={() => handleCellClick(category.key, subcategory, month)}
                              >
                                {value > 0 ? formatCurrency(value) : ''}
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-bold bg-gray-50">
                        {formatCurrency(
                          Array.from({ length: 12 }, (_, i) => getOpexValue(category.key, subcategory, i + 1))
                            .reduce((sum, val) => sum + val, 0)
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ))}
                {/* Total Row */}
                <TableRow className="border-t-2 border-gray-300 bg-gray-50">
                  <TableCell colSpan={2} className="font-bold text-center">TOPLAM</TableCell>
                  {MONTHS.map((_, monthIndex) => (
                    <TableCell key={monthIndex} className="text-center font-bold">
                      {formatCurrency(getTotalByMonth(monthIndex + 1))}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold text-lg">
                    {formatCurrency(getGrandTotal())}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};