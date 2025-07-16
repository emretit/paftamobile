
import { Employee } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SalaryForm } from "./salary/SalaryForm";
import { SalaryInfo } from "./salary/SalaryInfo";
import { Plus } from "lucide-react";

interface EmployeeSalaryTabProps {
  employee: Employee;
  refetch: () => Promise<void>;
}

export const EmployeeSalaryTab = ({ employee, refetch }: EmployeeSalaryTabProps) => {
  const [open, setOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<any>(null);

  const handleSaveSalary = async (values: any) => {
    setOpen(false);
    setEditingSalary(null);
    await refetch();
  };

  const handleEditSalary = (salaryData: any) => {
    setEditingSalary(salaryData);
    setOpen(true);
  };

  const handleNewSalary = () => {
    setEditingSalary(null);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Maaş Bilgileri</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewSalary}>
              <Plus className="h-4 w-4 mr-2" />
              Maaş Bilgilerini Düzenle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" aria-describedby="salary-form-description">
            <DialogHeader>
              <DialogTitle>
                {editingSalary ? "Maaş Bilgilerini Güncelle" : "Yeni Maaş Kaydı"}
              </DialogTitle>
              <p id="salary-form-description" className="text-sm text-muted-foreground">
                Çalışanın maaş bilgilerini düzenleyin veya yeni maaş kaydı oluşturun
              </p>
            </DialogHeader>
            <SalaryForm
              employeeId={employee.id}
              existingSalary={editingSalary}
              onSave={handleSaveSalary}
              onClose={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <SalaryInfo employeeId={employee.id} onEdit={handleEditSalary} />
    </div>
  );
};
