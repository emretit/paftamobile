import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCashflowMain } from "@/hooks/useCashflowMain";

const CASHFLOW_STRUCTURE = [
  {
    key: 'opening_balance',
    label: 'Dönem Başı Bakiyesi',
    subcategories: ['Nakit ve Nakit Benzerleri'],
    type: 'balance'
  },
  {
    key: 'operating_inflows',
    label: 'Faaliyetlerden Gelen Nakit (Tahsilatlar)',
    subcategories: [
      'Ürün Satışları',
      'Hizmet Gelirleri',
      'Diğer Nakit Girişleri'
    ],
    type: 'inflow'
  },
  {
    key: 'operating_outflows',
    label: 'Faaliyetlerden Çıkan Nakit (Ödemeler)',
    subcategories: [
      'Operasyonel Giderler (OPEX)',
      'Personel Giderleri',
      'Kira Giderleri',
      'Elektrik/Su/Doğalgaz/İnternet',
      'Vergi ve Resmi Ödemeler',
      'Pazarlama Giderleri',
      'Diğer Nakit Çıkışları'
    ],
    type: 'outflow'
  },
  {
    key: 'investing_activities',
    label: 'Yatırım Faaliyetleri',
    subcategories: [
      'Demirbaş/Makine Alımları',
      'Yatırım Amaçlı Ödemeler',
      'Yatırımlardan Gelen Nakit'
    ],
    type: 'investing'
  },
  {
    key: 'financing_activities',
    label: 'Finansman Faaliyetleri',
    subcategories: [
      'Kredi Kullanımı',
      'Kredi Geri Ödemeleri',
      'Sermaye Artırımı',
      'Kar Payı Dağıtımı'
    ],
    type: 'financing'
  },
  {
    key: 'other_activities',
    label: 'Diğer Gelir ve Giderler',
    subcategories: [
      'Faiz Geliri',
      'Faiz Gideri',
      'Kur Farkı Kar/Zarar',
      'Olağandışı Gelir/Gider'
    ],
    type: 'other'
  },
  {
    key: 'closing_balance',
    label: 'Dönem Sonu Bakiyesi',
    subcategories: ['Nakit ve Nakit Benzerleri'],
    type: 'balance'
  }
];

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];


const CashflowOverview = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { data, loading, refetch } = useCashflowMain();

  // Refetch data only when year changes and avoid unnecessary calls
  useEffect(() => {
    if (selectedYear) {
      refetch(selectedYear);
    }
  }, [selectedYear]); // Removed refetch from dependencies to prevent infinite loops

  const getValue = (category: string, subcategory: string, month: number) => {
    const item = data.find(d => 
      d.main_category === category && 
      d.subcategory === subcategory && 
      d.month === month && 
      d.year === selectedYear
    );
    return item?.value || 0;
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
    return CASHFLOW_STRUCTURE.reduce((sum, category) => {
      if (category.type === 'balance') return sum;
      
      return sum + category.subcategories.reduce((catSum, subcategory) => {
        const value = getValue(category.key, subcategory, month);
        return catSum + (category.type === 'outflow' ? -value : value);
      }, 0);
    }, 0);
  };

  const getNetCashFlow = () => {
    return Array.from({ length: 12 }, (_, i) => getTotalByMonth(i + 1))
      .reduce((sum, monthTotal) => sum + monthTotal, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  if (loading) {
    return <div className="flex justify-center items-center h-64">Veriler yükleniyor...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Year Selection */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Finansal Genel Bakış</h1>
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

      {/* Cashflow Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Nakit Girişi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                CASHFLOW_STRUCTURE.filter(c => c.type === 'inflow' || c.type === 'investing' || c.type === 'financing')
                  .reduce((sum, cat) => sum + getTotalByCategory(cat.key), 0)
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Nakit Çıkışı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(
                CASHFLOW_STRUCTURE.filter(c => c.type === 'outflow')
                  .reduce((sum, cat) => sum + getTotalByCategory(cat.key), 0)
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Nakit Akışı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getNetCashFlow() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(getNetCashFlow())}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aylık Ortalama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(getNetCashFlow() / 12)}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default CashflowOverview;