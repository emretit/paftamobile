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
  existingSalary?: any; // For editing existing salary record
}

export const SalaryForm = ({ employeeId, onSave, onClose, existingSalary }: SalaryFormProps) => {
  const { toast } = useToast();
  const [calculatedCosts, setCalculatedCosts] = useState({
    sgkEmployer: 0,
    unemploymentEmployer: 0,
    accidentInsurance: 0,
    totalEmployerCost: 0
  });

  // Turkish minimum wage calculations for 2025 - Resimlerden alınan doğru değerler
  const MINIMUM_WAGE_GROSS = 26005.50; // Brüt asgari ücret
  const MINIMUM_WAGE_NET = 22104.67; // Net asgari ücret
  
  // Asgari ücret hesaplama formülleri (Resimlerdeki doğru değerler)
  const calculateMinimumWageCosts = () => {
    // İşçi kesintileri (İkinci resimden)
    const sgkEmployee = MINIMUM_WAGE_GROSS * 0.14; // SGK İşçi %14 = 3,640.77
    const unemploymentEmployee = MINIMUM_WAGE_GROSS * 0.01; // İşsizlik İşçi %1 = 260.06
    const totalDeductions = 3900.83; // Kesintiler toplamı (resimde yazıyor)
    
    // İşveren primleri (İlk resimden)
    const sgkEmployer = 4355.92; // SGK Primi %16.75 (İşveren Payı)
    const unemploymentEmployer = 520.11; // İşveren İşsizlik Sigorta Primi %2
    
    const totalEmployerCost = 30881.53; // İşverene Toplam Maliyet (resimde yazıyor)
    
    return {
      sgkEmployee,
      unemploymentEmployee,
      totalDeductions,
      sgkEmployer,
      unemploymentEmployer,
      totalEmployerCost
    };
  };
  
  const minimumWageCosts = calculateMinimumWageCosts();

  const form = useForm({
    defaultValues: {
      salaryInputType: existingSalary?.salary_input_type || "gross",
      grossSalary: existingSalary?.gross_salary?.toString() || "",
      netSalary: existingSalary?.net_salary?.toString() || "",
      calculateAsMinimumWage: existingSalary?.calculate_as_minimum_wage || false,
      mealAllowance: existingSalary?.meal_allowance?.toString() || "0",
      transportAllowance: existingSalary?.transport_allowance?.toString() || "0",
      sgkEmployerRate: existingSalary?.sgk_employer_rate?.toString() || "15.75",
      unemploymentEmployerRate: existingSalary?.unemployment_employer_rate?.toString() || "2.0",
      accidentInsuranceRate: existingSalary?.accident_insurance_rate?.toString() || "0.0",
      stampTax: existingSalary?.stamp_tax?.toString() || "0",
      severanceProvision: existingSalary?.severance_provision?.toString() || "0",
      bonusProvision: existingSalary?.bonus_provision?.toString() || "0",
      notes: existingSalary?.notes || ""
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

      let sgkEmployer, unemploymentEmployer, accidentInsurance, totalEmployerCost;

      if (calculateAsMinimumWage) {
        // Asgari ücret formüllerine göre hesapla
        sgkEmployer = minimumWageCosts.sgkEmployer; // 4,355.92
        unemploymentEmployer = minimumWageCosts.unemploymentEmployer; // 520.11
        accidentInsurance = 0; // Asgari ücrette iş kazası yok
        
        // Gerçek net maaşı al
        const currentNetSalary = salaryInputType === "net" ? parseFloat(netSalary) || 0 : calculateNetFromGross(currentGross);
        
        // Yardımları da ekle
        const mealAllowance = parseFloat(form.getValues("mealAllowance")) || 0;
        const transportAllowance = parseFloat(form.getValues("transportAllowance")) || 0;
        
        // Toplam maliyet = Net maaş + işveren primleri + yardımlar
        totalEmployerCost = currentNetSalary + sgkEmployer + unemploymentEmployer + accidentInsurance + stampTax + severance + bonus + mealAllowance + transportAllowance;
      } else {
        // Normal hesaplama: Net maaş + işveren primleri + yardımlar
        sgkEmployer = currentGross * (sgkRate / 100);
        unemploymentEmployer = currentGross * (unemploymentRate / 100);
        accidentInsurance = currentGross * (accidentRate / 100);
        
        // Gerçek net maaşı al
        const currentNetSalary = salaryInputType === "net" ? parseFloat(netSalary) || 0 : calculateNetFromGross(currentGross);
        
        // Yardımları da toplam maliyete dahil et
        const mealAllowance = parseFloat(form.getValues("mealAllowance")) || 0;
        const transportAllowance = parseFloat(form.getValues("transportAllowance")) || 0;
        
        // Toplam maliyet = Net maaş + işveren primleri + yardımlar
        totalEmployerCost = currentNetSalary + sgkEmployer + unemploymentEmployer + accidentInsurance + stampTax + severance + bonus + mealAllowance + transportAllowance;
      }

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
      const salaryData = {
        employee_id: employeeId,
        gross_salary: parseFloat(values.grossSalary),
        net_salary: parseFloat(values.netSalary),
        salary_input_type: values.salaryInputType,
        calculate_as_minimum_wage: values.calculateAsMinimumWage,
        meal_allowance: parseFloat(values.mealAllowance || '0'),
        transport_allowance: parseFloat(values.transportAllowance || '0'),
        effective_date: new Date().toISOString().split('T')[0], // Always use current date
        sgk_employer_rate: parseFloat(values.sgkEmployerRate),
        unemployment_employer_rate: parseFloat(values.unemploymentEmployerRate),
        accident_insurance_rate: parseFloat(values.accidentInsuranceRate),
        stamp_tax: parseFloat(values.stampTax),
        severance_provision: parseFloat(values.severanceProvision),
        bonus_provision: parseFloat(values.bonusProvision),
        notes: values.notes
      };

      // Use UPSERT to handle both insert and update
      const { data, error } = await supabase
        .from('employee_salaries')
        .upsert(salaryData, { 
          onConflict: 'employee_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: existingSalary ? "Maaş bilgileri başarıyla güncellendi" : "Maaş kaydı başarıyla eklendi",
      });

      await onSave(values);
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Maaş bilgileri kaydedilirken hata oluştu",
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
                       İşveren maliyetleri asgari ücret (₺{MINIMUM_WAGE_GROSS.toLocaleString('tr-TR')}) üzerinden hesaplanır
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
                name="mealAllowance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yemek Yardımı (₺)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="transportAllowance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yol Yardımı (₺)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="0" />
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
                       Asgari ücret formülü: ₺{MINIMUM_WAGE_GROSS.toLocaleString('tr-TR')} x %16.75 = ₺{minimumWageCosts.sgkEmployer.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
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
            {existingSalary ? "Maaş Bilgilerini Güncelle" : "Maaş Kaydını Kaydet"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            İptal
          </Button>
        </div>
      </form>
    </Form>
  );
};