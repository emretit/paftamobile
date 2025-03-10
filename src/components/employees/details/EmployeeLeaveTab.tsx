
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Calendar, Clock } from "lucide-react";
import { useForm } from "react-hook-form";

interface EmployeeLeaveTabProps {
  employeeId: string;
}

interface LeaveRecord {
  id: string;
  employee_id: string;
  leave_type: 'annual' | 'sick' | 'parental' | 'unpaid' | 'other';
  start_date: string;
  end_date: string;
  total_days: number;
  status: 'approved' | 'pending' | 'rejected';
  reason: string;
  notes: string | null;
  approved_by: string | null;
  created_at: string;
}

export const EmployeeLeaveTab = ({ employeeId }: EmployeeLeaveTabProps) => {
  const [leaveHistory, setLeaveHistory] = useState<LeaveRecord[]>([]);
  const [leaveBalance, setLeaveBalance] = useState({
    annual: 20,
    sick: 10,
    parental: 5,
    unpaid: 0,
    other: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      leave_type: 'annual',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      reason: '',
      notes: '',
    }
  });

  useEffect(() => {
    const fetchLeaveHistory = async () => {
      try {
        setIsLoading(true);
        // This is a placeholder until the actual leave table is created
        // Using mock data for now
        const mockData: LeaveRecord[] = [
          {
            id: '1',
            employee_id: employeeId,
            leave_type: 'annual',
            start_date: '2023-06-10',
            end_date: '2023-06-20',
            total_days: 10,
            status: 'approved',
            reason: 'Yıllık izin',
            notes: null,
            approved_by: 'Some Manager',
            created_at: '2023-05-01T00:00:00Z'
          },
          {
            id: '2',
            employee_id: employeeId,
            leave_type: 'sick',
            start_date: '2023-03-15',
            end_date: '2023-03-18',
            total_days: 3,
            status: 'approved',
            reason: 'Hastalık izni',
            notes: 'Doktor raporu ile',
            approved_by: 'Some Manager',
            created_at: '2023-03-14T00:00:00Z'
          },
          {
            id: '3',
            employee_id: employeeId,
            leave_type: 'annual',
            start_date: '2023-12-25',
            end_date: '2023-12-29',
            total_days: 5,
            status: 'pending',
            reason: 'Yıl sonu tatili',
            notes: null,
            approved_by: null,
            created_at: '2023-11-10T00:00:00Z'
          }
        ];
        
        setLeaveHistory(mockData);
      } catch (error) {
        console.error('Error fetching leave history:', error);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "İzin bilgileri yüklenirken bir hata oluştu.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveHistory();
  }, [employeeId, toast]);

  const handleSubmit = async (values: any) => {
    try {
      const startDate = new Date(values.start_date);
      const endDate = new Date(values.end_date);
      
      // Calculate days difference
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      
      if (startDate > endDate) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Başlangıç tarihi bitiş tarihinden sonra olamaz.",
        });
        return;
      }
      
      // This is a placeholder until the actual leave table is created
      console.log('Submitted leave data:', { 
        ...values, 
        employee_id: employeeId,
        total_days: diffDays
      });
      
      toast({
        title: "Başarılı",
        description: "İzin talebi kaydedildi.",
      });
      setIsFormOpen(false);
      
      // Add the new record to the state (simulating DB update)
      const newRecord: LeaveRecord = {
        id: Date.now().toString(),
        employee_id: employeeId,
        leave_type: values.leave_type as any,
        start_date: values.start_date,
        end_date: values.end_date,
        total_days: diffDays,
        status: 'pending',
        reason: values.reason,
        notes: values.notes,
        approved_by: null,
        created_at: new Date().toISOString()
      };
      
      setLeaveHistory([...leaveHistory, newRecord]);
      
      // Update leave balance
      setLeaveBalance({
        ...leaveBalance,
        [values.leave_type]: leaveBalance[values.leave_type as keyof typeof leaveBalance] - diffDays
      });
    } catch (error) {
      console.error('Error saving leave data:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İzin talebi kaydedilirken bir hata oluştu.",
      });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getLeaveTypeDisplay = (type: string) => {
    switch (type) {
      case 'annual':
        return 'Yıllık İzin';
      case 'sick':
        return 'Hastalık İzni';
      case 'parental':
        return 'Doğum İzni';
      case 'unpaid':
        return 'Ücretsiz İzin';
      case 'other':
        return 'Diğer';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">İzin Yönetimi</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Yeni İzin Talebi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Yeni İzin Talebi Oluştur</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="leave_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İzin Türü</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="İzin türü seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="annual">Yıllık İzin</SelectItem>
                        <SelectItem value="sick">Hastalık İzni</SelectItem>
                        <SelectItem value="parental">Doğum İzni</SelectItem>
                        <SelectItem value="unpaid">Ücretsiz İzin</SelectItem>
                        <SelectItem value="other">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Başlangıç Tarihi</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bitiş Tarihi</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İzin Nedeni</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit">İzin Talebi Oluştur</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kalan Yıllık İzin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalance.annual} gün</div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Yıllık izin hakkı
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kalan Hastalık İzni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalance.sick} gün</div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Hastalık izni hakkı
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen İzin Talepleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveHistory.filter(record => record.status === 'pending').length}
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Onay bekliyor
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>İzin Geçmişi & Talepleri</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Yükleniyor...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İzin Türü</TableHead>
                  <TableHead>Başlangıç</TableHead>
                  <TableHead>Bitiş</TableHead>
                  <TableHead>Toplam Gün</TableHead>
                  <TableHead>Neden</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Talep Tarihi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Henüz izin kaydı bulunmamaktadır.
                    </TableCell>
                  </TableRow>
                ) : (
                  leaveHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{getLeaveTypeDisplay(record.leave_type)}</TableCell>
                      <TableCell>{new Date(record.start_date).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{new Date(record.end_date).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{record.total_days} gün</TableCell>
                      <TableCell>{record.reason}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(record.status)}`}>
                          {record.status === 'approved' ? 'Onaylandı' :
                           record.status === 'pending' ? 'Beklemede' :
                           'Reddedildi'}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(record.created_at).toLocaleDateString('tr-TR')}</TableCell>
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
