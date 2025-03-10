
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, FileEdit } from "lucide-react";
import { useForm } from "react-hook-form";

interface EmployeeSalaryTabProps {
  employeeId: string;
}

interface SalaryRecord {
  id: string;
  employee_id: string;
  base_salary: number;
  allowances: number;
  bonuses: number;
  deductions: number;
  effective_date: string;
  payment_date: string;
  status: 'paid' | 'pending' | 'processing';
  notes: string | null;
  created_at: string;
}

export const EmployeeSalaryTab = ({ employeeId }: EmployeeSalaryTabProps) => {
  const [salaryHistory, setSalaryHistory] = useState<SalaryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      base_salary: 0,
      allowances: 0,
      bonuses: 0,
      deductions: 0,
      effective_date: new Date().toISOString().split('T')[0],
      payment_date: new Date().toISOString().split('T')[0],
      notes: '',
    }
  });

  useEffect(() => {
    const fetchSalaryHistory = async () => {
      try {
        setIsLoading(true);
        // This is a placeholder until the actual salary table is created
        // Using mock data for now
        const mockData: SalaryRecord[] = [
          {
            id: '1',
            employee_id: employeeId,
            base_salary: 10000,
            allowances: 1000,
            bonuses: 500,
            deductions: 200,
            effective_date: '2023-01-01',
            payment_date: '2023-01-05',
            status: 'paid',
            notes: 'Regular monthly salary',
            created_at: '2023-01-01T00:00:00Z'
          },
          {
            id: '2',
            employee_id: employeeId,
            base_salary: 10000,
            allowances: 1000,
            bonuses: 1000,
            deductions: 200,
            effective_date: '2023-02-01',
            payment_date: '2023-02-05',
            status: 'paid',
            notes: 'Monthly salary with performance bonus',
            created_at: '2023-02-01T00:00:00Z'
          }
        ];
        
        setSalaryHistory(mockData);
      } catch (error) {
        console.error('Error fetching salary history:', error);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Maaş bilgileri yüklenirken bir hata oluştu.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalaryHistory();
  }, [employeeId, toast]);

  const handleSubmit = async (values: any) => {
    try {
      // This is a placeholder until the actual salary table is created
      console.log('Submitted salary data:', { ...values, employee_id: employeeId });
      toast({
        title: "Başarılı",
        description: "Maaş bilgileri kaydedildi.",
      });
      setIsFormOpen(false);
      
      // Add the new record to the state (simulating DB update)
      const newRecord: SalaryRecord = {
        id: Date.now().toString(),
        employee_id: employeeId,
        base_salary: values.base_salary,
        allowances: values.allowances,
        bonuses: values.bonuses,
        deductions: values.deductions,
        effective_date: values.effective_date,
        payment_date: values.payment_date,
        status: 'pending',
        notes: values.notes,
        created_at: new Date().toISOString()
      };
      
      setSalaryHistory([...salaryHistory, newRecord]);
    } catch (error) {
      console.error('Error saving salary data:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Maaş bilgileri kaydedilirken bir hata oluştu.",
      });
    }
  };

  const calculateNetSalary = (record: SalaryRecord) => {
    return record.base_salary + record.allowances + record.bonuses - record.deductions;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Maaş Yönetimi</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Yeni Maaş Kaydı
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Yeni Maaş Kaydı Ekle</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="base_salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temel Maaş</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allowances"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yan Ödemeler</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bonuses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bonuslar</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deductions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kesintiler</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="effective_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Geçerlilik Tarihi</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payment_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ödeme Tarihi</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit">Kaydet</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Son Maaş</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salaryHistory.length > 0 ? 
                `₺${calculateNetSalary(salaryHistory[salaryHistory.length - 1]).toLocaleString()}` : 
                "₺0"}
            </div>
            <p className="text-xs text-gray-500">
              {salaryHistory.length > 0 ? 
                `${new Date(salaryHistory[salaryHistory.length - 1].payment_date).toLocaleDateString('tr-TR')}` : 
                "-"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Bonuslar (Yıllık)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {`₺${salaryHistory.reduce((sum, record) => sum + record.bonuses, 0).toLocaleString()}`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Aylık Net</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salaryHistory.length > 0 ? 
                `₺${(salaryHistory.reduce((sum, record) => sum + calculateNetSalary(record), 0) / salaryHistory.length).toLocaleString()}` : 
                "₺0"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maaş Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Yükleniyor...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ödeme Tarihi</TableHead>
                  <TableHead>Temel Maaş</TableHead>
                  <TableHead>Yan Ödemeler</TableHead>
                  <TableHead>Bonuslar</TableHead>
                  <TableHead>Kesintiler</TableHead>
                  <TableHead>Net Ödeme</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Henüz maaş kaydı bulunmamaktadır.
                    </TableCell>
                  </TableRow>
                ) : (
                  salaryHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.payment_date).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>₺{record.base_salary.toLocaleString()}</TableCell>
                      <TableCell>₺{record.allowances.toLocaleString()}</TableCell>
                      <TableCell>₺{record.bonuses.toLocaleString()}</TableCell>
                      <TableCell>₺{record.deductions.toLocaleString()}</TableCell>
                      <TableCell>₺{calculateNetSalary(record).toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.status === 'paid' ? 'bg-green-100 text-green-800' :
                          record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {record.status === 'paid' ? 'Ödendi' :
                           record.status === 'pending' ? 'Beklemede' :
                           'İşlemde'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileEdit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
