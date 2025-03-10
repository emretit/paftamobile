
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { SalaryRecord } from "./types";

export const useSalaryData = (employeeId: string) => {
  const [salaryHistory, setSalaryHistory] = useState<SalaryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

  const addSalaryRecord = (newRecord: SalaryRecord) => {
    setSalaryHistory([...salaryHistory, newRecord]);
  };

  return {
    salaryHistory,
    isLoading,
    addSalaryRecord
  };
};
