import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SalaryRecord {
  id: string;
  gross_salary: number;
  net_salary: number;
  total_employer_cost: number;
  sgk_employer_amount: number;
  unemployment_employer_amount: number;
  accident_insurance_amount: number;
  effective_date: string;
  meal_allowance: number;
  transport_allowance: number;
  notes?: string;
}

interface SalaryInfoProps {
  employeeId: string;
  onEdit?: (salaryData: SalaryRecord) => void;
}

export const SalaryInfo = ({ employeeId, onEdit }: SalaryInfoProps) => {
  const [currentSalary, setCurrentSalary] = useState<SalaryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentSalary();
  }, [employeeId]);

  const fetchCurrentSalary = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_salaries')
        .select('*')
        .eq('employee_id', employeeId)
        .order('effective_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentSalary(data || null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Maaş bilgileri yüklenirken hata oluştu",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!currentSalary) return;

    const headers = [
      'Kayıt Tarihi',
      'Brüt Maaş',
      'Net Maaş',
      'Yemek Yardımı',
      'Yol Yardımı',
      'SGK İşveren Primi',
      'İşsizlik Sigortası',
      'İş Kazası Sigortası',
      'Toplam İşveren Maliyeti',
      'Notlar'
    ];

    const csvData = [[
      new Date(currentSalary.effective_date).toLocaleDateString('tr-TR'),
      currentSalary.gross_salary.toLocaleString('tr-TR'),
      currentSalary.net_salary.toLocaleString('tr-TR'),
      currentSalary.meal_allowance.toLocaleString('tr-TR'),
      currentSalary.transport_allowance.toLocaleString('tr-TR'),
      currentSalary.sgk_employer_amount.toLocaleString('tr-TR'),
      currentSalary.unemployment_employer_amount.toLocaleString('tr-TR'),
      currentSalary.accident_insurance_amount.toLocaleString('tr-TR'),
      currentSalary.total_employer_cost.toLocaleString('tr-TR'),
      currentSalary.notes || ''
    ]];

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `maaş-bilgileri-${employeeId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Maaş bilgileri yükleniyor...</div>
        </CardContent>
      </Card>
    );
  }

  if (!currentSalary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Maaş Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Henüz maaş kaydı bulunmuyor.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Brüt Maaş</div>
            <div className="text-2xl font-bold">
              ₺{currentSalary.gross_salary.toLocaleString('tr-TR')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Net Maaş</div>
            <div className="text-2xl font-bold">
              ₺{currentSalary.net_salary.toLocaleString('tr-TR')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Yemek + Yol</div>
            <div className="text-2xl font-bold">
              ₺{(currentSalary.meal_allowance + currentSalary.transport_allowance).toLocaleString('tr-TR')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Toplam İşveren Maliyeti</div>
            <div className="text-2xl font-bold">
              ₺{currentSalary.total_employer_cost.toLocaleString('tr-TR')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maaş Bilgileri Tablosu */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Güncel Maaş Bilgileri</CardTitle>
          <div className="flex gap-2">
            {onEdit && (
              <Button onClick={() => onEdit(currentSalary)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
            )}
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              CSV İndir
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kayıt Tarihi</TableHead>
                <TableHead>Brüt Maaş</TableHead>
                <TableHead>Net Maaş</TableHead>
                <TableHead>Yemek Yardımı</TableHead>
                <TableHead>Yol Yardımı</TableHead>
                <TableHead>SGK İşveren</TableHead>
                <TableHead>Toplam Maliyet</TableHead>
                <TableHead>Notlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  {new Date(currentSalary.effective_date).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell className="font-medium">
                  ₺{currentSalary.gross_salary.toLocaleString('tr-TR')}
                </TableCell>
                <TableCell>
                  ₺{currentSalary.net_salary.toLocaleString('tr-TR')}
                </TableCell>
                <TableCell>
                  ₺{currentSalary.meal_allowance.toLocaleString('tr-TR')}
                </TableCell>
                <TableCell>
                  ₺{currentSalary.transport_allowance.toLocaleString('tr-TR')}
                </TableCell>
                <TableCell>
                  ₺{currentSalary.sgk_employer_amount.toLocaleString('tr-TR')}
                </TableCell>
                <TableCell className="font-medium">
                  ₺{(currentSalary.net_salary + 
                      currentSalary.sgk_employer_amount + 
                      currentSalary.unemployment_employer_amount + 
                      currentSalary.accident_insurance_amount + 
                      (currentSalary.meal_allowance || 0) + 
                      (currentSalary.transport_allowance || 0)).toLocaleString('tr-TR')}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {currentSalary.notes}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};