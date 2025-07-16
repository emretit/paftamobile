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
import { cn } from "@/lib/utils";

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

  // Turkish minimum wage calculations for 2025 - YENİ FORMÜL
  const MINIMUM_WAGE_GROSS = 26005.50; // Brüt asgari ücret
  const MINIMUM_WAGE_NET = 22104.67; // Net asgari ücret
  const MINIMUM_WAGE_EMPLOYER_COST = 8516; // Sabit işveren maliyeti
  
  // Asgari ücret hesaplama formülleri - YENİ MANTIK
  const calculateMinimumWageCosts = () => {
    // İşveren primleri (sabit değerler)
    const sgkEmployer = 4355.92; // SGK Primi %16.75 (İşveren Payı)
    const unemploymentEmployer = 520.11; // İşveren İşsizlik Sigorta Primi %2
    
    // Toplam işveren maliyeti sabit
    const totalEmployerCost = MINIMUM_WAGE_EMPLOYER_COST; // 8516 TL sabit
    
    return {
      sgkEmployer,
      unemploymentEmployer,
      totalEmployerCost,
      netSalary: MINIMUM_WAGE_NET
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

      // Yemek ve yol yardımlarını al
      const mealAllowance = parseFloat(form.getValues("mealAllowance")) || 0;
      const transportAllowance = parseFloat(form.getValues("transportAllowance")) || 0;

              if (calculateAsMinimumWage) {
          // Asgari ücret formüllerine göre hesapla - YENİ MANTIK
          sgkEmployer = minimumWageCosts.sgkEmployer; // 4,355.92 (sadece gösterim için)
          unemploymentEmployer = minimumWageCosts.unemploymentEmployer; // 520.11 (sadece gösterim için)
          accidentInsurance = 0; // Asgari ücrette iş kazası yok
          
          // Gerçek net maaşı al
          const currentNetSalary = salaryInputType === "net" ? parseFloat(netSalary) || 0 : calculateNetFromGross(currentGross);
          
          // YENİ FORMÜL: Net maaş + 8516 TL sabit işveren maliyeti + yol + yemek yardımları
          totalEmployerCost = currentNetSalary + MINIMUM_WAGE_EMPLOYER_COST + mealAllowance + transportAllowance;
      } else {
        // Normal hesaplama: Tüm hesaplamalar gerçek brüt maaş üzerinden
        sgkEmployer = currentGross * (sgkRate / 100);
        unemploymentEmployer = currentGross * (unemploymentRate / 100);
        accidentInsurance = currentGross * (accidentRate / 100);
        
        // Toplam maliyet = Brüt maaş + işveren primleri + yol + yemek + diğer maliyetler
        totalEmployerCost = currentGross + sgkEmployer + unemploymentEmployer + accidentInsurance + mealAllowance + transportAllowance + stampTax + severance + bonus;
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
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Temel Maaş Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                💰 Temel Maaş Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Maaş Giriş Tipi Seçimi */}
              <FormField
                control={form.control}
                name="salaryInputType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Maaş Giriş Şekli</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-8"
                      >
                        <div className="flex items-center space-x-3 border rounded-lg p-4">
                          <RadioGroupItem value="gross" id="gross" />
                          <Label htmlFor="gross" className="font-medium">Brüt Maaş Gir</Label>
                        </div>
                        <div className="flex items-center space-x-3 border rounded-lg p-4">
                          <RadioGroupItem value="net" id="net" />
                          <Label htmlFor="net" className="font-medium">Net Maaş Gir</Label>
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-2 leading-none">
                      <FormLabel className="text-base font-semibold text-blue-800">
                        🎯 Asgari ücret olarak hesapla
                      </FormLabel>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p>• İşveren maliyetleri sabit ₺{MINIMUM_WAGE_EMPLOYER_COST.toLocaleString('tr-TR')} olarak hesaplanır</p>
                        <p>• Toplam maliyet: <strong>Net maaş + ₺{MINIMUM_WAGE_EMPLOYER_COST.toLocaleString('tr-TR')} + Yol + Yemek</strong></p>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Maaş Girişi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="grossSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Brüt Maaş (₺)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="Brüt maaşı girin"
                          disabled={salaryInputType === "net"}
                          className={cn(
                            "text-lg h-12",
                            salaryInputType === "net" ? "bg-gray-100 text-gray-600" : "border-2 border-green-300 focus:border-green-500"
                          )}
                        />
                      </FormControl>
                      {salaryInputType === "net" && (
                        <p className="text-sm text-muted-foreground">✨ Otomatik hesaplanıyor</p>
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
                      <FormLabel className="text-base font-semibold">Net Maaş (₺)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="Net maaşı girin"
                          disabled={salaryInputType === "gross"}
                          className={cn(
                            "text-lg h-12",
                            salaryInputType === "gross" ? "bg-gray-100 text-gray-600" : "border-2 border-blue-300 focus:border-blue-500"
                          )}
                        />
                      </FormControl>
                      {salaryInputType === "gross" && (
                        <p className="text-sm text-muted-foreground">✨ Otomatik hesaplanıyor</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Yardımlar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="mealAllowance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">🍽️ Yemek Yardımı (₺)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="0"
                          className="text-lg h-12 border-2 border-orange-300 focus:border-orange-500"
                        />
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
                      <FormLabel className="text-base font-semibold">🚗 Yol Yardımı (₺)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="0"
                          className="text-lg h-12 border-2 border-purple-300 focus:border-purple-500"
                        />
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
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  📊 Hesaplanan İşveren Maliyetleri
                  {calculateAsMinimumWage && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border border-blue-300">
                      Asgari ücret bazlı hesaplama
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">SGK İşveren Primi</Label>
                    <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                      <div className="text-xl font-bold text-green-700">
                        ₺{calculatedCosts.sgkEmployer.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                      {calculateAsMinimumWage && (
                        <p className="text-xs text-gray-500 mt-1">
                          Asgari ücret x %16.75
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">İşsizlik Sigortası</Label>
                    <div className="bg-white rounded-lg p-4 border-2 border-yellow-200">
                      <div className="text-xl font-bold text-yellow-700">
                        ₺{calculatedCosts.unemploymentEmployer.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">İş Kazası Sigortası</Label>
                    <div className="bg-white rounded-lg p-4 border-2 border-red-200">
                      <div className="text-xl font-bold text-red-700">
                        ₺{calculatedCosts.accidentInsurance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">TOPLAM MALİYET</Label>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white border-2 border-blue-300">
                      <div className="text-2xl font-bold">
                        ₺{calculatedCosts.totalEmployerCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hesaplama Detayları */}
                {calculateAsMinimumWage && (grossSalary || netSalary) && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">📝 Hesaplama Detayları (Yeni Formül)</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Net maaş: <strong>₺{(salaryInputType === "net" ? parseFloat(netSalary) || 0 : calculateNetFromGross(parseFloat(grossSalary) || 0)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong></p>
                      <p>• Sabit işveren maliyeti: <strong>₺{MINIMUM_WAGE_EMPLOYER_COST.toLocaleString('tr-TR')}</strong></p>
                      <p>• Yemek yardımı: <strong>₺{(parseFloat(form.getValues("mealAllowance")) || 0).toLocaleString('tr-TR')}</strong></p>
                      <p>• Yol yardımı: <strong>₺{(parseFloat(form.getValues("transportAllowance")) || 0).toLocaleString('tr-TR')}</strong></p>
                      <hr className="my-2" />
                      <p className="font-semibold">• Toplam: <strong>₺{calculatedCosts.totalEmployerCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong></p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notlar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📝 Notlar</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Ek notlar girin..."
                        className="text-base h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Butonlar */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 h-12 text-lg bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            >
              {existingSalary ? "✏️ Maaş Bilgilerini Güncelle" : "💾 Maaş Kaydını Kaydet"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="h-12 px-8 text-lg border-2"
            >
              ❌ İptal
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};