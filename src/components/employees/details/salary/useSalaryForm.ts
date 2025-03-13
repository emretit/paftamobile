
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useSalaryForm = (employeeId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const saveSalary = async (values: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('employee_salaries')
        .insert({
          employee_id: employeeId,
          amount: values.base_salary,
          currency: 'TRY',
          effective_date: values.effective_date,
          payment_date: values.payment_date,
          gross_salary: values.base_salary + values.allowances + values.bonuses,
          net_salary: values.base_salary + values.allowances + values.bonuses - values.deductions,
          notes: values.notes,
          allowances: {
            allowances: values.allowances,
            bonuses: values.bonuses,
            deductions: values.deductions
          }
        });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Maaş bilgisi başarıyla kaydedildi"
      });
      
      return true;
    } catch (error) {
      console.error('Maaş bilgisi kaydedilirken hata:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Maaş bilgisi kaydedilirken bir hata oluştu"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    saveSalary
  };
};
