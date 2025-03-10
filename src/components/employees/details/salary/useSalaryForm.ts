
import { useForm } from "react-hook-form";

export const useSalaryForm = (employeeId: string) => {
  // This hook can be expanded with validation, state management, etc.
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

  return form;
};
