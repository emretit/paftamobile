
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useSalaryForm } from "./useSalaryForm";

interface SalaryFormProps {
  employeeId: string;
  onSave: (values: any) => Promise<void>;
  onClose: () => void;
}

export const SalaryForm = ({ employeeId, onSave, onClose }: SalaryFormProps) => {
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

  const handleSubmit = async (values: any) => {
    await onSave(values);
  };

  return (
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
  );
};
