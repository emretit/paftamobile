
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { usePerformanceForm } from "./usePerformanceForm";
import { PerformanceRecord } from "./types";

interface PerformanceFormProps {
  employeeId: string;
  onSuccess: (record: PerformanceRecord) => void;
  onClose: () => void;
}

export const PerformanceForm = ({ employeeId, onSuccess, onClose }: PerformanceFormProps) => {
  const { form, handleSubmit } = usePerformanceForm(employeeId, onSuccess, onClose);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <FormField
        control={form.control}
        name="review_period"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Değerlendirme Dönemi</FormLabel>
            <FormControl>
              <Input type="month" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="technical_score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teknik Performans (1-5)</FormLabel>
              <FormControl>
                <Input type="number" min="1" max="5" step="0.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="communication_score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İletişim (1-5)</FormLabel>
              <FormControl>
                <Input type="number" min="1" max="5" step="0.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="teamwork_score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Takım Çalışması (1-5)</FormLabel>
              <FormControl>
                <Input type="number" min="1" max="5" step="0.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="leadership_score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Liderlik (1-5)</FormLabel>
              <FormControl>
                <Input type="number" min="1" max="5" step="0.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="strengths"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Güçlü Yönleri</FormLabel>
            <FormControl>
              <Textarea rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="areas_for_improvement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Geliştirilmesi Gereken Alanlar</FormLabel>
            <FormControl>
              <Textarea rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="goals"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hedefler</FormLabel>
            <FormControl>
              <Textarea rows={3} {...field} />
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
            <FormLabel>Ek Notlar</FormLabel>
            <FormControl>
              <Textarea rows={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex justify-end">
        <Button type="submit">Değerlendirmeyi Kaydet</Button>
      </div>
    </form>
  );
};
