
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Employee, EmployeeSalary } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { DollarSign, PlusCircle } from "lucide-react";

interface EmployeeSalaryTabProps {
  employee: Employee;
}

export const EmployeeSalaryTab = ({ employee }: EmployeeSalaryTabProps) => {
  const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSalaries = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('employee_salaries')
          .select('*')
          .eq('employee_id', employee.id)
          .order('effective_date', { ascending: false });

        if (error) throw error;
        setSalaries(data as EmployeeSalary[]);
      } catch (error) {
        console.error('Error fetching salary data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load salary information",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalaries();
  }, [employee.id, toast]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary" />
            Salary Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-primary" />
          Salary Information
        </CardTitle>
        <Button size="sm" variant="outline" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Salary Record
        </Button>
      </CardHeader>
      <CardContent>
        {salaries.length > 0 ? (
          <div className="space-y-4">
            {salaries.map((salary) => (
              <div key={salary.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">Effective: {new Date(salary.effective_date).toLocaleDateString()}</h3>
                  <span className="text-lg font-semibold">{salary.gross_salary.toLocaleString()} TL</span>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Net Salary: {salary.net_salary.toLocaleString()} TL</p>
                  {Object.entries(salary.allowances || {}).length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Allowances:</p>
                      <ul className="list-disc list-inside">
                        {Object.entries(salary.allowances).map(([key, value]) => (
                          <li key={key}>
                            {key}: {typeof value === 'number' ? value.toLocaleString() : value} TL
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No salary records found for this employee.</p>
            <Button variant="outline" className="mt-4">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add First Salary Record
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
