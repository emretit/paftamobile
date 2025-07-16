import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Download, TrendingUp, TrendingDown, Target, Calculator, DollarSign } from "lucide-react";

// Sample data structure with realistic values
const SAMPLE_DATA = {
  2024: {
    'opening_balance': {
      'Nakit ve Nakit Benzerleri': [250000, 350000, 420000, 380000, 450000, 520000, 480000, 550000, 620000, 580000, 650000, 720000]
    },
    'operating_inflows': {
      'Ürün Satışları': [150000, 180000, 220000, 195000, 240000, 280000, 260000, 320000, 290000, 350000, 330000, 380000],
      'Hizmet Gelirleri': [80000, 95000, 110000, 125000, 140000, 155000, 170000, 185000, 200000, 215000, 230000, 245000],
      'Diğer Nakit Girişleri': [15000, 20000, 18000, 25000, 22000, 30000, 28000, 35000, 32000, 40000, 38000, 45000]
    },
    'operating_outflows': {
      'Operasyonel Giderler (OPEX)': [50000, 55000, 60000, 58000, 65000, 70000, 68000, 75000, 72000, 80000, 78000, 85000],
      'Personel Giderleri': [120000, 120000, 125000, 125000, 130000, 130000, 135000, 135000, 140000, 140000, 145000, 145000],
      'Kira Giderleri': [25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000],
      'Elektrik/Su/Doğalgaz/İnternet': [8000, 9000, 8500, 9500, 9000, 10000, 9500, 11000, 10000, 11500, 11000, 12000],
      'Vergi ve Resmi Ödemeler': [30000, 20000, 35000, 25000, 40000, 30000, 45000, 35000, 50000, 40000, 55000, 45000],
      'Pazarlama Giderleri': [20000, 25000, 30000, 28000, 35000, 40000, 38000, 45000, 42000, 50000, 48000, 55000],
      'Diğer Nakit Çıkışları': [12000, 15000, 18000, 16000, 20000, 22000, 25000, 28000, 26000, 30000, 32000, 35000]
    },
    'investing_activities': {
      'Demirbaş/Makine Alımları': [0, 50000, 0, 75000, 0, 100000, 0, 25000, 0, 80000, 0, 120000],
      'Yatırım Amaçlı Ödemeler': [0, 0, 30000, 0, 0, 50000, 0, 0, 40000, 0, 0, 60000],
      'Yatırımlardan Gelen Nakit': [0, 0, 0, 0, 20000, 0, 0, 0, 0, 30000, 0, 0]
    },
    'financing_activities': {
      'Kredi Kullanımı': [0, 100000, 0, 0, 150000, 0, 0, 200000, 0, 0, 100000, 0],
      'Kredi Geri Ödemeleri': [25000, 25000, 25000, 30000, 30000, 30000, 35000, 35000, 35000, 40000, 40000, 40000],
      'Sermaye Artırımı': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500000],
      'Kar Payı Dağıtımı': [0, 0, 0, 50000, 0, 0, 0, 75000, 0, 0, 0, 100000]
    },
    'other_activities': {
      'Faiz Geliri': [2000, 2500, 3000, 2800, 3500, 4000, 3800, 4500, 4200, 5000, 4800, 5500],
      'Faiz Gideri': [8000, 8500, 9000, 9500, 10000, 10500, 11000, 11500, 12000, 12500, 13000, 13500],
      'Kur Farkı Kar/Zarar': [5000, -2000, 8000, -3000, 10000, -1000, 12000, -4000, 15000, -2000, 18000, -5000],
      'Olağandışı Gelir/Gider': [3000, 0, 5000, 0, 7000, 0, 9000, 0, 11000, 0, 13000, 0]
    }
  }
};

const CASHFLOW_STRUCTURE = [
  {
    key: 'opening_balance',
    label: 'DÖNEM BAŞI BAKİYESİ',
    subcategories: ['Nakit ve Nakit Benzerleri'],
    type: 'balance',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    key: 'operating_inflows',
    label: 'FAALİYETLERDEN GELEN NAKİT (TAHSİLATLAR)',
    subcategories: [
      'Ürün Satışları',
      'Hizmet Gelirleri',
      'Diğer Nakit Girişleri'
    ],
    type: 'inflow',
    color: 'bg-green-50 border-green-200'
  },
  {
    key: 'operating_outflows',
    label: 'FAALİYETLERDEN ÇIKAN NAKİT (ÖDEMELER)',
    subcategories: [
      'Operasyonel Giderler (OPEX)',
      'Personel Giderleri',
      'Kira Giderleri',
      'Elektrik/Su/Doğalgaz/İnternet',
      'Vergi ve Resmi Ödemeler',
      'Pazarlama Giderleri',
      'Diğer Nakit Çıkışları'
    ],
    type: 'outflow',
    color: 'bg-red-50 border-red-200'
  },
  {
    key: 'investing_activities',
    label: 'YATIRIM FAALİYETLERİ',
    subcategories: [
      'Demirbaş/Makine Alımları',
      'Yatırım Amaçlı Ödemeler',
      'Yatırımlardan Gelen Nakit'
    ],
    type: 'investing',
    color: 'bg-purple-50 border-purple-200'
  },
  {
    key: 'financing_activities',
    label: 'FİNANSMAN FAALİYETLERİ',
    subcategories: [
      'Kredi Kullanımı',
      'Kredi Geri Ödemeleri',
      'Sermaye Artırımı',
      'Kar Payı Dağıtımı'
    ],
    type: 'financing',
    color: 'bg-orange-50 border-orange-200'
  },
  {
    key: 'other_activities',
    label: 'DİĞER GELİR VE GİDERLER',
    subcategories: [
      'Faiz Geliri',
      'Faiz Gideri',
      'Kur Farkı Kar/Zarar',
      'Olağandışı Gelir/Gider'
    ],
    type: 'other',
    color: 'bg-yellow-50 border-yellow-200'
  }
];

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const EnhancedCashflowTable = () => {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [editingCell, setEditingCell] = useState<{ category: string; subcategory: string; month: number } | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [data, setData] = useState(SAMPLE_DATA);

  const getValue = (category: string, subcategory: string, month: number) => {
    return data[selectedYear]?.[category]?.[subcategory]?.[month - 1] || 0;
  };

  const getTotalByCategory = (category: string) => {
    const categoryData = CASHFLOW_STRUCTURE.find(c => c.key === category);
    if (!categoryData) return 0;
    
    return categoryData.subcategories.reduce((sum, subcategory) => {
      return sum + Array.from({ length: 12 }, (_, i) => getValue(category, subcategory, i + 1))
        .reduce((monthSum, value) => monthSum + value, 0);
    }, 0);
  };

  const getTotalByMonth = (month: number) => {
    const inflows = CASHFLOW_STRUCTURE
      .filter(c => c.type === 'inflow')
      .reduce((sum, category) => 
        sum + category.subcategories.reduce((catSum, subcategory) => 
          catSum + getValue(category.key, subcategory, month), 0), 0);

    const outflows = CASHFLOW_STRUCTURE
      .filter(c => c.type === 'outflow')
      .reduce((sum, category) => 
        sum + category.subcategories.reduce((catSum, subcategory) => 
          catSum + getValue(category.key, subcategory, month), 0), 0);

    return inflows - outflows;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('₺', '₺ ');
  };

  const getMonthlyChartData = () => {
    return MONTHS.map((month, index) => ({
      month: month.substring(0, 3),
      nakit_girisi: CASHFLOW_STRUCTURE
        .filter(c => c.type === 'inflow')
        .reduce((sum, category) => sum + category.subcategories.reduce((catSum, subcategory) => 
          catSum + getValue(category.key, subcategory, index + 1), 0), 0),
      nakit_cikisi: CASHFLOW_STRUCTURE
        .filter(c => c.type === 'outflow')
        .reduce((sum, category) => sum + category.subcategories.reduce((catSum, subcategory) => 
          catSum + getValue(category.key, subcategory, index + 1), 0), 0),
      net_akis: getTotalByMonth(index + 1),
    }));
  };

  const getCategoryTotals = () => {
    return CASHFLOW_STRUCTURE.filter(c => c.type !== 'balance').map(category => ({
      category: category.label,
      amount: getTotalByCategory(category.key),
      type: category.type,
      color: category.color
    }));
  };

  const getTotalInflows = () => {
    return CASHFLOW_STRUCTURE
      .filter(c => c.type === 'inflow')
      .reduce((sum, cat) => sum + getTotalByCategory(cat.key), 0);
  };

  const getTotalOutflows = () => {
    return CASHFLOW_STRUCTURE
      .filter(c => c.type === 'outflow')
      .reduce((sum, cat) => sum + getTotalByCategory(cat.key), 0);
  };

  const getNetCashFlow = () => {
    return getTotalInflows() - getTotalOutflows();
  };

  const handleCellEdit = (category: string, subcategory: string, month: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    
    setData(prevData => ({
      ...prevData,
      [selectedYear]: {
        ...prevData[selectedYear],
        [category]: {
          ...prevData[selectedYear][category],
          [subcategory]: prevData[selectedYear][category][subcategory].map((val, idx) => 
            idx === month - 1 ? numValue : val
          )
        }
      }
    }));
    
    setEditingCell(null);
    setTempValue('');
  };

  const handleCellClick = (category: string, subcategory: string, month: number) => {
    setEditingCell({ category, subcategory, month });
    setTempValue(getValue(category, subcategory, month).toString());
  };

  const handleKeyPress = (e: React.KeyboardEvent, category: string, subcategory: string, month: number) => {
    if (e.key === 'Enter') {
      handleCellEdit(category, subcategory, month, tempValue);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setTempValue('');
    }
  };

  const exportToExcel = () => {
    const csvData = [];
    
    // Header
    csvData.push(['NAKİT AKIŞ TABLOSU', '', '', '', '', '', '', '', '', '', '', '', '']);
    csvData.push(['Ana Kategori', 'Alt Kategori', ...MONTHS, 'TOPLAM']);
    
    CASHFLOW_STRUCTURE.forEach(category => {
      category.subcategories.forEach(subcategory => {
        const monthlyValues = MONTHS.map((_, index) => getValue(category.key, subcategory, index + 1));
        const total = monthlyValues.reduce((sum, val) => sum + val, 0);
        
        csvData.push([
          category.label,
          subcategory,
          ...monthlyValues,
          total
        ]);
      });
    });
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `nakit_akis_tablosu_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">NAKİT AKIŞ TABLOSU - VERİ TABANI</h1>
        <div className="flex gap-4 items-center">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025, 2026].map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportToExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Excel İndir
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Nakit Girişi</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(getTotalInflows())}
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
                <p className="text-sm font-medium text-muted-foreground">Toplam Nakit Çıkışı</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(getTotalOutflows())}
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
                <p className="text-sm font-medium text-muted-foreground">Net Nakit Akışı</p>
                <p className={`text-2xl font-bold ${getNetCashFlow() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(getNetCashFlow())}
                </p>
              </div>
              <DollarSign className={`h-8 w-8 ${getNetCashFlow() >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aylık Ortalama</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(getNetCashFlow() / 12)}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Aylık Nakit Akış Trendi ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={getMonthlyChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number) => [`${formatCurrency(value)}`, '']}
                  labelFormatter={(label) => `${label} ${selectedYear}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="nakit_girisi" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  name="Nakit Girişi"
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="nakit_cikisi" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="Nakit Çıkışı"
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="net_akis" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Net Akış"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kategori Bazlı Nakit Akışı</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={getCategoryTotals()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  fontSize={10}
                />
                <YAxis tickFormatter={(value) => `₺${(value / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Tutar']} />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Cash Flow Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="border border-gray-300 p-3 text-left min-w-[250px]">Ana Kategori</th>
                  <th className="border border-gray-300 p-3 text-left min-w-[200px]">Alt Kategori</th>
                  {MONTHS.map(month => (
                    <th key={month} className="border border-gray-300 p-3 text-center min-w-[100px]">{month.substring(0, 3)}</th>
                  ))}
                  <th className="border border-gray-300 p-3 text-center min-w-[120px]">TOPLAM</th>
                </tr>
              </thead>
              <tbody>
                {CASHFLOW_STRUCTURE.map(category => (
                  category.subcategories.map((subcategory, subIndex) => (
                    <tr key={`${category.key}-${subIndex}`} className={`hover:bg-gray-50 ${category.color}`}>
                      {subIndex === 0 && (
                        <td 
                          rowSpan={category.subcategories.length} 
                          className={`border border-gray-300 p-3 font-bold text-sm ${category.color} vertical-text`}
                        >
                          {category.label}
                        </td>
                      )}
                      <td className="border border-gray-300 p-3 font-medium text-sm">{subcategory}</td>
                      {MONTHS.map((_, monthIndex) => {
                        const month = monthIndex + 1;
                        const value = getValue(category.key, subcategory, month);
                        const isEditing = editingCell?.category === category.key && 
                                         editingCell?.subcategory === subcategory && 
                                         editingCell?.month === month;
                        
                        return (
                          <td key={monthIndex} className="border border-gray-300 p-2 text-center">
                            {isEditing ? (
                              <Input
                                type="number"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onKeyDown={(e) => handleKeyPress(e, category.key, subcategory, month)}
                                onBlur={() => handleCellEdit(category.key, subcategory, month, tempValue)}
                                className="w-20 text-center text-xs"
                                autoFocus
                              />
                            ) : (
                              <div
                                className="cursor-pointer hover:bg-blue-100 p-1 rounded text-xs"
                                onClick={() => handleCellClick(category.key, subcategory, month)}
                              >
                                {value > 0 ? formatCurrency(value) : '-'}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="border border-gray-300 p-2 text-center font-bold bg-gray-100 text-xs">
                        {formatCurrency(
                          Array.from({ length: 12 }, (_, i) => getValue(category.key, subcategory, i + 1))
                            .reduce((sum, val) => sum + val, 0)
                        )}
                      </td>
                    </tr>
                  ))
                ))}
                
                {/* Monthly Totals Row */}
                <tr className="border-t-4 border-gray-600 bg-slate-100 font-bold">
                  <td colSpan={2} className="border border-gray-300 p-3">NET NAKİT AKIŞI</td>
                  {MONTHS.map((_, monthIndex) => {
                    const month = monthIndex + 1;
                    const netFlow = getTotalByMonth(month);
                    return (
                      <td key={monthIndex} className={`border border-gray-300 p-2 text-center ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'} text-xs`}>
                        {formatCurrency(netFlow)}
                      </td>
                    );
                  })}
                  <td className={`border border-gray-300 p-2 text-center font-bold text-lg ${getNetCashFlow() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(getNetCashFlow())}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {getCategoryTotals().slice(0, 6).map((category, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold">
                  {formatCurrency(category.amount)}
                </div>
                <Badge variant={category.type === 'inflow' ? 'default' : 'destructive'}>
                  {category.type === 'inflow' ? 'Gelir' : 'Gider'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};