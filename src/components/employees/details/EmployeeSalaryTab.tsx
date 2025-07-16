
import { Employee } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SalaryForm } from "./salary/SalaryForm";
import { SalaryHistory } from "./salary/SalaryHistory";
import { Plus } from "lucide-react";

interface EmployeeSalaryTabProps {
  employee: Employee;
  refetch: () => Promise<void>;
}

export const EmployeeSalaryTab = ({ employee, refetch }: EmployeeSalaryTabProps) => {
  const [open, setOpen] = useState(false);

  const handleSaveSalary = async (values: any) => {
    setOpen(false);
    await refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Maaş Bilgileri ve İşveren Maliyetleri</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Maaş Kaydı
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Maaş Kaydı Ekle</DialogTitle>
            </DialogHeader>
            <SalaryForm
              employeeId={employee.id}
              onSave={handleSaveSalary}
              onClose={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <SalaryHistory employeeId={employee.id} />
    </div>
  );
};
