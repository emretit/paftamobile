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

// Turkish Tax Brackets for 2025 (Yearly amounts in TL)
const TAX_BRACKETS = [
  { min: 0, max: 70000, rate: 0.15 },
  { min: 70000, max: 190000, rate: 0.20 },
  { min: 190000, max: 650000, rate: 0.27 },
  { min: 650000, max: 1800000, rate: 0.35 },
  { min: 1800000, max: Infinity, rate: 0.40 }
];

export const SalaryForm = ({ employeeId, onSave, onClose, existingSalary }: SalaryFormProps) => {
  const { toast } = useToast();
  const [calculatedCosts, setCalculatedCosts] = useState({
    sgkEmployer: 0,
    unemploymentEmployer: 0,
    accidentInsurance: 0,
    sgkEmployee: 0,
    unemploymentEmployee: 0,
    incomeTax: 0,
    stampTax: 0,
    totalDeductions: 0,
    totalEmployerCost: 0,
    netSalary: 0
  });

  // Turkish minimum wage for 2025
  const MINIMUM_WAGE_GROSS = 26004.70; // From user's example
  const MINIMUM_WAGE_NET = 22104; // From user's example
  
  // Calculate progressive income tax based on cumulative yearly income
  const calculateProgressiveIncomeTax = (monthlyGross: number, cumulativeYearlyGross: number) => {
    const newCumulativeGross = cumulativeYearlyGross + monthlyGross;
    
    let totalTax = 0;
    let remainingIncome = newCumulativeGross;
    
    for (const bracket of TAX_BRACKETS) {
      if (remainingIncome <= 0) break;
      
      const taxableInThisBracket = Math.min(remainingIncome, bracket.max - bracket.min);
      totalTax += taxableInThisBracket * bracket.rate;
      remainingIncome -= taxableInThisBracket;
    }
    
    // Calculate previous cumulative tax
    let prevTotalTax = 0;
    let prevRemainingIncome = cumulativeYearlyGross;
    
    for (const bracket of TAX_BRACKETS) {
      if (prevRemainingIncome <= 0) break;
      
      const taxableInThisBracket = Math.min(prevRemainingIncome, bracket.max - bracket.min);
      prevTotalTax += taxableInThisBracket * bracket.rate;
      prevRemainingIncome -= taxableInThisBracket;
    }
    
    // Monthly tax is the difference
    return totalTax - prevTotalTax;
  };

  // Calculate detailed Turkish salary breakdown
  const calculateTurkishSalaryBreakdown = (grossSalary: number, cumulativeYearlyGross: number = 0) => {
    // Employee Deductions
    const sgkEmployee = grossSalary * 0.14; // 14% SSK Employee
    const unemploymentEmployee = grossSalary * 0.01; // 1% Unemployment Employee
    const stampTax = grossSalary * 0.00759; // 0.759% Stamp Tax
    const incomeTax = calculateProgressiveIncomeTax(grossSalary, cumulativeYearlyGross);
    
    const totalDeductions = sgkEmployee + unemploymentEmployee + stampTax + incomeTax;
    const netSalary = grossSalary - totalDeductions;
    
    // Employer Costs
    const sgkEmployer = grossSalary * 0.1575; // 15.75% SSK Employer
    const unemploymentEmployer = grossSalary * 0.02; // 2% Unemployment Employer
    const accidentInsurance = grossSalary * 0.002; // 0.2% default accident insurance
    
    return {
      sgkEmployee,
      unemploymentEmployee,
      incomeTax,
      stampTax,
      totalDeductions,
      netSalary,
      sgkEmployer,
      unemploymentEmployer,
      accidentInsurance
    };
  };

  const form = useForm({
    defaultValues: {
      salaryInputType: existingSalary?.salary_input_type || "gross",
      grossSalary: existingSalary?.gross_salary?.toString() || "",
      netSalary: existingSalary?.net_salary?.toString() || "",
      calculateAsMinimumWage: existingSalary?.calculate_as_minimum_wage || false,
      mealAllowance: existingSalary?.meal_allowance?.toString() || "0",
      transportAllowance: existingSalary?.transport_allowance?.toString() || "0",
      sgkEmployeeRate: existingSalary?.sgk_employee_rate?.toString() || "14.0",
      sgkEmployerRate: existingSalary?.sgk_employer_rate?.toString() || "15.75",
      unemploymentEmployeeRate: existingSalary?.unemployment_employee_rate?.toString() || "1.0",
      unemploymentEmployerRate: existingSalary?.unemployment_employer_rate?.toString() || "2.0",
      accidentInsuranceRate: existingSalary?.accident_insurance_rate?.toString() || "0.2",
      stampTaxRate: existingSalary?.stamp_tax_rate?.toString() || "0.759",
      severanceProvision: existingSalary?.severance_provision?.toString() || "0",
      bonusProvision: existingSalary?.bonus_provision?.toString() || "0",
      cumulativeYearlyGross: existingSalary?.cumulative_yearly_gross?.toString() || "0",
      notes: existingSalary?.notes || ""
    }
  });

  const salaryInputType = form.watch("salaryInputType");
  const grossSalary = form.watch("grossSalary");
  const netSalary = form.watch("netSalary");
  const calculateAsMinimumWage = form.watch("calculateAsMinimumWage");
  const cumulativeYearlyGross = form.watch("cumulativeYearlyGross");

  // Calculate gross from net using accurate Turkish tax calculation
  const calculateGrossFromNet = (netAmount: number, cumulativeYearly: number = 0) => {
    // Iterative calculation to find gross that results in desired net
    let estimatedGross = netAmount * 1.3; // Initial estimate
    let iterations = 0;
    const maxIterations = 10;
    
    while (iterations < maxIterations) {
      const breakdown = calculateTurkishSalaryBreakdown(estimatedGross, cumulativeYearly);
      const diff = breakdown.netSalary - netAmount;
      
      if (Math.abs(diff) < 1) break; // Close enough
      
      estimatedGross -= diff * 0.8; // Adjust with damping factor
      iterations++;
    }
    
    return estimatedGross;
  };

  useEffect(() => {
    let currentGross = 0;
    const cumulativeYearly = parseFloat(cumulativeYearlyGross) || 0;
    
    if (salaryInputType === "gross" && grossSalary) {
      currentGross = parseFloat(grossSalary) || 0;
      // Auto-calculate net from gross using accurate Turkish calculations
      const breakdown = calculateTurkishSalaryBreakdown(currentGross, cumulativeYearly);
      form.setValue("netSalary", breakdown.netSalary.toFixed(2), { shouldValidate: false });
    } else if (salaryInputType === "net" && netSalary) {
      currentGross = calculateGrossFromNet(parseFloat(netSalary) || 0, cumulativeYearly);
      // Auto-calculate gross from net
      form.setValue("grossSalary", currentGross.toFixed(2), { shouldValidate: false });
    }

    if (currentGross > 0) {
      const breakdown = calculateTurkishSalaryBreakdown(currentGross, cumulativeYearly);
      const mealAllowance = parseFloat(form.getValues("mealAllowance")) || 0;
      const transportAllowance = parseFloat(form.getValues("transportAllowance")) || 0;
      const severance = parseFloat(form.getValues("severanceProvision")) || 0;
      const bonus = parseFloat(form.getValues("bonusProvision")) || 0;

      let totalEmployerCost;

      if (calculateAsMinimumWage && currentGross <= MINIMUM_WAGE_GROSS * 1.1) {
        // Minimum wage calculation: Use 30881 base + allowances + extra net payment
        const currentNetSalary = salaryInputType === "net" ? parseFloat(netSalary) || 0 : breakdown.netSalary;
        const extraPaymentFromNet = Math.max(0, currentNetSalary - MINIMUM_WAGE_NET);
        totalEmployerCost = 30881 + mealAllowance + transportAllowance + extraPaymentFromNet;
      } else {
        // Normal calculation: Gross + employer costs + allowances
        totalEmployerCost = currentGross + 
                           breakdown.sgkEmployer + 
                           breakdown.unemploymentEmployer + 
                           breakdown.accidentInsurance + 
                           mealAllowance + 
                           transportAllowance + 
                           severance + 
                           bonus;
      }

      setCalculatedCosts({
        sgkEmployer: breakdown.sgkEmployer,
        unemploymentEmployer: breakdown.unemploymentEmployer,
        accidentInsurance: breakdown.accidentInsurance,
        sgkEmployee: breakdown.sgkEmployee,
        unemploymentEmployee: breakdown.unemploymentEmployee,
        incomeTax: breakdown.incomeTax,
        stampTax: breakdown.stampTax,
        totalDeductions: breakdown.totalDeductions,
        netSalary: breakdown.netSalary,
        totalEmployerCost
      });
    }
  }, [salaryInputType, grossSalary, netSalary, calculateAsMinimumWage, cumulativeYearlyGross, form.watch()]);

  const handleSubmit = async (values: any) => {
    try {
      const grossSalaryValue = parseFloat(values.grossSalary);
      const breakdown = calculateTurkishSalaryBreakdown(grossSalaryValue, parseFloat(values.cumulativeYearlyGross || '0'));
      
      const salaryData = {
        employee_id: employeeId,
        gross_salary: grossSalaryValue,
        net_salary: breakdown.netSalary,
        salary_input_type: values.salaryInputType,
        calculate_as_minimum_wage: values.calculateAsMinimumWage,
        meal_allowance: parseFloat(values.mealAllowance || '0'),
        transport_allowance: parseFloat(values.transportAllowance || '0'),
        effective_date: new Date().toISOString().split('T')[0],
        
        // Employee deduction rates and amounts
        sgk_employee_rate: parseFloat(values.sgkEmployeeRate),
        sgk_employee_amount: breakdown.sgkEmployee,
        unemployment_employee_rate: parseFloat(values.unemploymentEmployeeRate),
        unemployment_employee_amount: breakdown.unemploymentEmployee,
        income_tax_amount: breakdown.incomeTax,
        stamp_tax_rate: parseFloat(values.stampTaxRate),
        stamp_tax_amount: breakdown.stampTax,
        total_deductions: breakdown.totalDeductions,
        
        // Employer rates and amounts
        sgk_employer_rate: parseFloat(values.sgkEmployerRate),
        unemployment_employer_rate: parseFloat(values.unemploymentEmployerRate),
        accident_insurance_rate: parseFloat(values.accidentInsuranceRate),
        
        // Additional costs
        severance_provision: parseFloat(values.severanceProvision || '0'),
        bonus_provision: parseFloat(values.bonusProvision || '0'),
        
        // Cumulative tracking
        cumulative_yearly_gross: parseFloat(values.cumulativeYearlyGross || '0'),
        tax_year: new Date().getFullYear(),
        
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
                        <p>• İşveren maliyetleri asgari ücret (₺{MINIMUM_WAGE_GROSS.toLocaleString('tr-TR')}) üzerinden hesaplanır</p>
                        <p>• Toplam maliyet: <strong>30.881 + Yol + Yemek + Net maaştan kalan</strong></p>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Kümülatif Yıllık Brüt Maaş */}
              <FormField
                control={form.control}
                name="cumulativeYearlyGross"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">📊 Kümülatif Yıllık Brüt Maaş (₺)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="Bu yıl önceki aylarda alınan toplam brüt maaş"
                        className="text-lg h-12 border-2 border-yellow-300 focus:border-yellow-500"
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      ℹ️ Gelir vergisinin doğru hesaplanması için gereklidir
                    </p>
                    <FormMessage />
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

          {/* Hesaplanan Maliyetler ve Kesintiler */}
          {(grossSalary || netSalary) && (
            <>
              {/* İşçi Kesintileri */}
              <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    📉 İşçi Kesintileri (Türk Vergi Sistemi)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">SGK İşçi (%14)</Label>
                      <div className="bg-white rounded-lg p-3 border-2 border-red-200">
                        <div className="text-lg font-bold text-red-700">
                          ₺{calculatedCosts.sgkEmployee.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">İşsizlik (%1)</Label>
                      <div className="bg-white rounded-lg p-3 border-2 border-orange-200">
                        <div className="text-lg font-bold text-orange-700">
                          ₺{calculatedCosts.unemploymentEmployee.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">Gelir Vergisi (Kademeli)</Label>
                      <div className="bg-white rounded-lg p-3 border-2 border-purple-200">
                        <div className="text-lg font-bold text-purple-700">
                          ₺{calculatedCosts.incomeTax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">Damga Vergisi (%0.759)</Label>
                      <div className="bg-white rounded-lg p-3 border-2 border-gray-200">
                        <div className="text-lg font-bold text-gray-700">
                          ₺{calculatedCosts.stampTax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">NET MAAŞ</Label>
                      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-3 text-white">
                        <div className="text-xl font-bold">
                          ₺{calculatedCosts.netSalary.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">📋 Toplam Kesinti Özeti</h4>
                    <div className="text-lg">
                      <span className="text-gray-600">Toplam Kesintiler: </span>
                      <span className="font-bold text-red-700">
                        ₺{calculatedCosts.totalDeductions.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({((calculatedCosts.totalDeductions / parseFloat(grossSalary || '1')) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* İşveren Maliyetleri */}
              <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    📊 İşveren Maliyetleri
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
                      <Label className="text-sm font-medium text-gray-600">SGK İşveren (%15.75)</Label>
                      <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                        <div className="text-xl font-bold text-green-700">
                          ₺{calculatedCosts.sgkEmployer.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">İşsizlik İşveren (%2)</Label>
                      <div className="bg-white rounded-lg p-4 border-2 border-yellow-200">
                        <div className="text-xl font-bold text-yellow-700">
                          ₺{calculatedCosts.unemploymentEmployer.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">İş Kazası (%0.2)</Label>
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
                      <h4 className="font-semibold text-gray-800 mb-2">📝 Asgari Ücret Hesaplama Detayları</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• Baz maliyet: <strong>₺30.881</strong></p>
                        <p>• Yemek yardımı: <strong>₺{(parseFloat(form.getValues("mealAllowance")) || 0).toLocaleString('tr-TR')}</strong></p>
                        <p>• Yol yardımı: <strong>₺{(parseFloat(form.getValues("transportAllowance")) || 0).toLocaleString('tr-TR')}</strong></p>
                        <p>• Net maaştan kalan: <strong>₺{Math.max(0, calculatedCosts.netSalary - MINIMUM_WAGE_NET).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong></p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
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