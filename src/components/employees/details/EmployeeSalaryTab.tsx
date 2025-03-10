
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus, CreditCard, AlertCircle } from "lucide-react";
import { SalaryStats } from "./salary/SalaryStats";
import { SalaryHistory } from "./salary/SalaryHistory";
import { SalaryForm } from "./salary/SalaryForm";
import { useSalaryData } from "./salary/useSalaryData";
import { SalaryRecord } from "./salary/types";

interface EmployeeSalaryTabProps {
  employeeId: string;
}

export const EmployeeSalaryTab = ({ employeeId }: EmployeeSalaryTabProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const { salaryHistory, isLoading, addSalaryRecord } = useSalaryData(employeeId);

  const handleSubmit = async (values: any) => {
    try {
      console.log('Submitted salary data:', { ...values, employee_id: employeeId });
      toast({
        title: "Başarılı",
        description: "Maaş bilgileri kaydedildi.",
      });
      setIsFormOpen(false);
      
      // Add the new record to the state
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
      
      addSalaryRecord(newRecord);
    } catch (error) {
      console.error('Error saving salary data:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Maaş bilgileri kaydedilirken bir hata oluştu.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-primary" />
          Maaş Yönetimi
        </h2>
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
            <SalaryForm 
              employeeId={employeeId} 
              onSave={handleSubmit} 
              onClose={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {salaryHistory.length === 0 && !isLoading ? (
        <div className="p-8 text-center bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center space-y-4">
            <AlertCircle className="h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-800">Henüz maaş kaydı bulunmuyor</h3>
            <p className="text-gray-600 max-w-md">
              Bu çalışan için henüz maaş kaydı girilmemiş. Yeni maaş kaydı eklemek için yukarıdaki butonu kullanabilirsiniz.
            </p>
          </div>
        </div>
      ) : (
        <>
          <SalaryStats salaryHistory={salaryHistory} />
          <SalaryHistory salaryHistory={salaryHistory} isLoading={isLoading} />
        </>
      )}
    </div>
  );
};
