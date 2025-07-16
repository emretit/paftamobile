import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SalaryFormProps {
  employeeId: string;
  onSave: (values: any) => Promise<void>;
  onClose: () => void;
}

export const SalaryForm = ({ employeeId, onSave, onClose }: SalaryFormProps) => {
  const { toast } = useToast();
  const [calculatedCosts, setCalculatedCosts] = useState({
    sgkEmployer: 0,
    unemploymentEmployer: 0,
    accidentInsurance: 0,
    totalEmployerCost: 0
  });

  const form = useForm({
    defaultValues: {
      grossSalary: "",
      netSalary: "",
      allowances: "{}",
      effectiveDate: "",
      sgkEmployerRate: "20.5",
      unemploymentEmployerRate: "3.0",
      accidentInsuranceRate: "2.0",
      stampTax: "0",
      severanceProvision: "0",
      bonusProvision: "0",
      notes: ""
    }
  });

  const grossSalary = form.watch("grossSalary");

  useEffect(() => {
    if (grossSalary) {
      const gross = parseFloat(grossSalary) || 0;
      const sgkRate = parseFloat(form.getValues("sgkEmployerRate")) || 20.5;
      const unemploymentRate = parseFloat(form.getValues("unemploymentEmployerRate")) || 3.0;
      const accidentRate = parseFloat(form.getValues("accidentInsuranceRate")) || 2.0;
      const stampTax = parseFloat(form.getValues("stampTax")) || 0;
      const severance = parseFloat(form.getValues("severanceProvision")) || 0;
      const bonus = parseFloat(form.getValues("bonusProvision")) || 0;

      const sgkEmployer = gross * (sgkRate / 100);
      const unemploymentEmployer = gross * (unemploymentRate / 100);
      const accidentInsurance = gross * (accidentRate / 100);
      const totalEmployerCost = gross + sgkEmployer + unemploymentEmployer + accidentInsurance + stampTax + severance + bonus;

      setCalculatedCosts({
        sgkEmployer,
        unemploymentEmployer,
        accidentInsurance,
        totalEmployerCost
      });
    }
  }, [grossSalary, form.watch()]);

  const handleSubmit = async (values: any) => {
    try {
      const { data, error } = await supabase
        .from('employee_salaries')
        .insert({
          employee_id: employeeId,
          gross_salary: parseFloat(values.grossSalary),
          net_salary: parseFloat(values.netSalary),
          allowances: JSON.parse(values.allowances || '{}'),
          effective_date: values.effectiveDate,
          sgk_employer_rate: parseFloat(values.sgkEmployerRate),
          unemployment_employer_rate: parseFloat(values.unemploymentEmployerRate),
          accident_insurance_rate: parseFloat(values.accidentInsuranceRate),
          stamp_tax: parseFloat(values.stampTax),
          severance_provision: parseFloat(values.severanceProvision),
          bonus_provision: parseFloat(values.bonusProvision),
          notes: values.notes
        });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Maaş kaydı başarıyla eklendi",
      });

      await onSave(values);
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Maaş kaydı eklenirken hata oluştu",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Temel Maaş Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Temel Maaş Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="grossSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brüt Maaş (₺)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Brüt maaşı girin" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="netSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Net Maaş (₺)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Net maaşı girin" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Geçerlilik Tarihi</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="allowances"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yan Haklar (JSON)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='{"yemek": 500, "yol": 300}' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* İşveren Maliyetleri */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">İşveren Maliyetleri ve Oranlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sgkEmployerRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SGK İşveren Primi (%)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unemploymentEmployerRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İşsizlik Sigortası İşveren Primi (%)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accidentInsuranceRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İş Kazası Sigortası (%)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="stampTax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Damga Vergisi (₺)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="severanceProvision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kıdem Tazminatı Karşılığı (₺)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bonusProvision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İkramiye Karşılığı (₺)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Hesaplanan Maliyetler */}
        {grossSalary && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hesaplanan İşveren Maliyetleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SGK İşveren Primi</Label>
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    ₺{calculatedCosts.sgkEmployer.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>İşsizlik Sigortası</Label>
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    ₺{calculatedCosts.unemploymentEmployer.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>İş Kazası Sigortası</Label>
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    ₺{calculatedCosts.accidentInsurance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Toplam İşveren Maliyeti</Label>
                  <Badge variant="default" className="w-full justify-center py-2 text-lg">
                    ₺{calculatedCosts.totalEmployerCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notlar */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notlar</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ek notlar girin" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Maaş Kaydını Kaydet
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            İptal
          </Button>
        </div>
      </form>
    </Form>
  );
};