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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

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

  // Turkish minimum wage for 2025 - Brüt asgari ücret
  const MINIMUM_WAGE = 26005.50; // 2025 brüt asgari ücret
  const MINIMUM_WAGE_NET = 22104.67; // 2025 net asgari ücret

  const form = useForm({
    defaultValues: {
      salaryInputType: "gross", // "gross" or "net"
      grossSalary: "",
      netSalary: "",
      calculateAsMinimumWage: false,
      allowances: "{}",
      effectiveDate: "",
      sgkEmployerRate: "15.75", // 2025 doğru SGK işveren primi
      unemploymentEmployerRate: "2.0", // 2025 doğru işsizlik işveren primi
      accidentInsuranceRate: "0.0", // İş kazası ayrı hesaplanacak
      stampTax: "0",
      severanceProvision: "0",
      bonusProvision: "0",
      notes: ""
    }
  });

  const salaryInputType = form.watch("salaryInputType");
  const grossSalary = form.watch("grossSalary");
  const netSalary = form.watch("netSalary");
  const calculateAsMinimumWage = form.watch("calculateAsMinimumWage");

  // Function to calculate gross from net salary based on 2025 rates
  const calculateGrossFromNet = (netAmount: number) => {
    // 2025 asgari ücret oranlarına göre hesaplama
    // Net: 22.104,67 TL => Brüt: 26.005,50 TL
    // Kesinti oranı: %15 (SGK %14 + İşsizlik %1)
    const deductionRate = 0.15; // %15 toplam kesinti
    const estimatedGross = netAmount / (1 - deductionRate);
    return estimatedGross;
  };

  // Function to calculate net from gross salary based on 2025 rates  
  const calculateNetFromGross = (grossAmount: number) => {
    // 2025 asgari ücret oranlarına göre hesaplama
    // Brüt: 26.005,50 TL => Net: 22.104,67 TL  
    // Kesinti oranı: %15 (SGK %14 + İşsizlik %1)
    const deductionRate = 0.15; // %15 toplam kesinti
    const estimatedNet = grossAmount * (1 - deductionRate);
    return estimatedNet;
  };

  useEffect(() => {
    let currentGross = 0;
    
    if (salaryInputType === "gross" && grossSalary) {
      currentGross = parseFloat(grossSalary) || 0;
      // Auto-calculate net from gross
      const calculatedNet = calculateNetFromGross(currentGross);
      form.setValue("netSalary", calculatedNet.toFixed(2), { shouldValidate: false });
    } else if (salaryInputType === "net" && netSalary) {
      currentGross = calculateGrossFromNet(parseFloat(netSalary) || 0);
      // Auto-calculate gross from net
      form.setValue("grossSalary", currentGross.toFixed(2), { shouldValidate: false });
    }

    if (currentGross > 0) {
      const sgkRate = parseFloat(form.getValues("sgkEmployerRate")) || 15.75;
      const unemploymentRate = parseFloat(form.getValues("unemploymentEmployerRate")) || 2.0;
      const accidentRate = parseFloat(form.getValues("accidentInsuranceRate")) || 0.0;
      const stampTax = parseFloat(form.getValues("stampTax")) || 0;
      const severance = parseFloat(form.getValues("severanceProvision")) || 0;
      const bonus = parseFloat(form.getValues("bonusProvision")) || 0;

      // Use minimum wage for calculations if option is selected
      const calculationBase = calculateAsMinimumWage ? MINIMUM_WAGE : currentGross;

      const sgkEmployer = calculationBase * (sgkRate / 100);
      const unemploymentEmployer = calculationBase * (unemploymentRate / 100);
      const accidentInsurance = calculationBase * (accidentRate / 100);
      
      // Toplam maliyet: Gerçek maaş + primlerin asgari ücret bazlı hesaplanması durumunda da gerçek maaş kullanılır
      // Sadece SGK primleri asgari ücret üzerinden hesaplanır, toplam maliyete gerçek maaş eklenir
      const totalEmployerCost = currentGross + sgkEmployer + unemploymentEmployer + accidentInsurance + stampTax + severance + bonus;

      setCalculatedCosts({
        sgkEmployer,
        unemploymentEmployer,
        accidentInsurance,
        totalEmployerCost
      });
    }
  }, [salaryInputType, grossSalary, netSalary, calculateAsMinimumWage, form.watch()]);

  const handleSubmit = async (values: any) => {
    try {
      const { data, error } = await supabase
        .from('employee_salaries')
        .insert({
          employee_id: employeeId,
          gross_salary: parseFloat(values.grossSalary),
          net_salary: parseFloat(values.netSalary),
          salary_input_type: values.salaryInputType,
          calculate_as_minimum_wage: values.calculateAsMinimumWage,
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
            {/* Maaş Giriş Tipi Seçimi */}
            <FormField
              control={form.control}
              name="salaryInputType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maaş Giriş Tipi</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="gross" id="gross" />
                        <Label htmlFor="gross">Brüt Maaş Gir</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="net" id="net" />
                        <Label htmlFor="net">Net Maaş Gir</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Asgari Ücret Hesaplama Seçeneği */}
            <FormField
              control={form.control}
              name="calculateAsMinimumWage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Asgari ücret olarak hesapla
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      İşveren maliyetleri asgari ücret (₺{MINIMUM_WAGE.toLocaleString('tr-TR')}) üzerinden hesaplanır
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="grossSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brüt Maaş (₺)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="Brüt maaşı girin"
                        disabled={salaryInputType === "net"}
                        className={salaryInputType === "net" ? "bg-gray-100" : ""}
                      />
                    </FormControl>
                    {salaryInputType === "net" && (
                      <p className="text-xs text-muted-foreground">Otomatik hesaplanıyor</p>
                    )}
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
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="Net maaşı girin"
                        disabled={salaryInputType === "gross"}
                        className={salaryInputType === "gross" ? "bg-gray-100" : ""}
                      />
                    </FormControl>
                    {salaryInputType === "gross" && (
                      <p className="text-xs text-muted-foreground">Otomatik hesaplanıyor</p>
                    )}
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


        {/* Hesaplanan Maliyetler */}
        {(grossSalary || netSalary) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Hesaplanan İşveren Maliyetleri
                {calculateAsMinimumWage && (
                  <Badge variant="outline" className="ml-2">
                    Asgari ücret bazlı hesaplama
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SGK İşveren Primi</Label>
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    ₺{calculatedCosts.sgkEmployer.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Badge>
                  {calculateAsMinimumWage && (
                    <p className="text-xs text-muted-foreground">
                      Hesaplama: ₺{MINIMUM_WAGE.toLocaleString('tr-TR')} x {form.getValues("sgkEmployerRate")}%
                    </p>
                  )}
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