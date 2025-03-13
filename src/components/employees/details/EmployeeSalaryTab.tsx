
import { Employee } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SalaryForm } from "./salary/SalaryForm";

interface EmployeeSalaryTabProps {
  employee: Employee;
}

export const EmployeeSalaryTab = ({ employee }: EmployeeSalaryTabProps) => {
  const [open, setOpen] = useState(false);

  const handleSaveSalary = async (values: any) => {
    // The logic is in the SalaryForm component
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Salary Information</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Salary Record</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Salary Record</DialogTitle>
            </DialogHeader>
            <SalaryForm
              employeeId={employee.id}
              onSave={handleSaveSalary}
              onClose={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salary History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No salary records found.</p>
        </CardContent>
      </Card>
    </div>
  );
};
