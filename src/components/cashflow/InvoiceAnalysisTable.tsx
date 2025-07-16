import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Calculator } from "lucide-react";
import { useInvoiceAnalysis } from "@/hooks/useInvoiceAnalysis";
import { useToast } from "@/components/ui/use-toast";

const InvoiceAnalysisTable = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [matrixData, setMatrixData] = useState<Record<string, Record<number, number>>>({});
  const [loading, setLoading] = useState(false);
  const { data, upsertInvoiceAnalysis, getDataForMonth, loading: dataLoading } = useInvoiceAnalysis(selectedYear);
  const { toast } = useToast();

  // Auto-save timeout
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const FIELDS = [
    { key: 'purchase_vat', label: 'Alış KDV' },
    { key: 'sales_vat', label: 'Satış KDV' },
    { key: 'vat_difference', label: 'Fark KDV' },
    { key: 'purchase_invoice', label: 'Alış Faturası' },
    { key: 'returns_received', label: 'İade Alınan' },
    { key: 'sales_invoice', label: 'Satış Faturası' },
    { key: 'returns_given', label: 'İade Verilen' },
    { key: 'profit_loss', label: 'Kar\\Zarar' }
  ];

  // Transform data from hook to matrix format
  useEffect(() => {
    const matrix: Record<string, Record<number, number>> = {};
    
    FIELDS.forEach(field => {
      matrix[field.key] = {};
      MONTHS.forEach((_, monthIndex) => {
        const month = monthIndex + 1;
        const monthData = getDataForMonth(selectedYear, month);
        matrix[field.key][month] = monthData?.[field.key as keyof typeof monthData] as number || 0;
      });
    });

    setMatrixData(matrix);
  }, [data, selectedYear]);

  // Auto-save cell value with debounce
  const handleCellChange = (field: string, month: number, value: string) => {
    const amount = parseFloat(value) || 0;
    
    setMatrixData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [month]: amount
      }
    }));

    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout for auto-save
    const newTimeout = setTimeout(async () => {
      try {
        await upsertInvoiceAnalysis({
          year: selectedYear,
          month: month,
          [field]: amount
        });
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 1000);

    setSaveTimeout(newTimeout);
  };

  // Get cell value
  const getCellValue = (field: string, month: number): number => {
    return matrixData[field]?.[month] || 0;
  };

  // Calculate row total
  const getRowTotal = (field: string): number => {
    const row = matrixData[field] || {};
    return Object.values(row).reduce((sum, value) => sum + value, 0);
  };

  // Calculate column total
  const getColumnTotal = (month: number): number => {
    return FIELDS.reduce((total, field) => {
      return total + getCellValue(field.key, month);
    }, 0);
  };

  // Calculate grand total
  const getGrandTotal = (): number => {
    return MONTHS.reduce((total, _, monthIndex) => {
      return total + getColumnTotal(monthIndex + 1);
    }, 0);
  };

  const formatTurkishCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Save all data functionality
  const saveAllData = async () => {
    try {
      setLoading(true);
      
      // Save all months data
      const savePromises = [];
      
      for (let month = 1; month <= 12; month++) {
        const monthData: any = { year: selectedYear, month };
        
        FIELDS.forEach(field => {
          monthData[field.key] = getCellValue(field.key, month);
        });
        
        savePromises.push(upsertInvoiceAnalysis(monthData));
      }
      
      await Promise.all(savePromises);
      
      toast({
        title: "Başarılı",
        description: "Tüm veriler kaydedildi.",
      });
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Veriler kaydedilirken bir hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Fatura Analizi
          </span>
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
            <Button onClick={saveAllData} disabled={loading || dataLoading}>
              <Save className="mr-2 h-4 w-4" />
              Kaydet
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left font-medium">Aylar</th>
                {FIELDS.map(field => (
                  <th key={field.key} className="border p-3 text-right font-medium">{field.label}</th>
                ))}
                <th className="border p-3 text-right font-medium">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((monthName, monthIndex) => {
                const month = monthIndex + 1;
                return (
                  <tr key={month} className="hover:bg-gray-50">
                    <td className="border p-3 font-medium">{String(month).padStart(2, '0')}-{monthName.toUpperCase()}</td>
                    {FIELDS.map(field => (
                      <td key={field.key} className="border p-1">
                        <Input
                          type="number"
                          value={getCellValue(field.key, month)}
                          onChange={(e) => handleCellChange(field.key, month, e.target.value)}
                          className="w-full text-right border-none bg-transparent focus:bg-white"
                          step="0.01"
                        />
                      </td>
                    ))}
                    <td className="border p-3 text-right font-medium">
                      {formatTurkishCurrency(getColumnTotal(month))}
                    </td>
                  </tr>
                );
              })}
              {/* Totals row */}
              <tr className="bg-gray-100 font-bold">
                <td className="border p-3 text-left">TOPLAM</td>
                {FIELDS.map(field => (
                  <td key={field.key} className="border p-3 text-right">
                    {field.key === 'profit_loss' ? (
                      <Badge variant={getRowTotal(field.key) > 0 ? "default" : "destructive"}>
                        {formatTurkishCurrency(getRowTotal(field.key))}
                      </Badge>
                    ) : (
                      formatTurkishCurrency(getRowTotal(field.key))
                    )}
                  </td>
                ))}
                <td className="border p-3 text-right font-bold">
                  {formatTurkishCurrency(getGrandTotal())}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceAnalysisTable;