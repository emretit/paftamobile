import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown, Download, Users, Calculator } from "lucide-react";
import { useOpexMatrix } from "@/hooks/useOpexMatrix";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface OpexCategory {
  name: string;
  subcategories: string[];
  isAutoPopulated?: boolean;
  type: 'personnel' | 'operational' | 'other';
}

interface EmployeeSalaryData {
  department: string;
  total_employer_cost: number;
  employee_count: number;
}

const OPEX_CATEGORIES: OpexCategory[] = [
  {
    name: "Personel Giderleri",
    subcategories: ["Maaşlar", "Prim & Bonus", "Sosyal Güvenlik", "Yemek Yardımı", "Ulaşım Yardımı", "Diğer Personel Giderleri"],
    isAutoPopulated: true,
    type: 'personnel'
  },
  {
    name: "Operasyonel Giderler",
    subcategories: ["Kira", "Elektrik", "Su", "Doğalgaz", "İnternet", "Telefon"],
    type: 'operational'
  },
  {
    name: "Ofis Giderleri",
    subcategories: ["Ofis Malzemeleri", "Temizlik", "Güvenlik", "Bakım"],
    type: 'other'
  },
  {
    name: "Pazarlama & Satış",
    subcategories: ["Reklam", "Promosyon", "Etkinlik", "Satış Komisyonu"],
    type: 'other'
  },
  {
    name: "Finansman Giderleri",
    subcategories: ["Kredi Faizleri", "Kart Komisyonları", "Banka Masrafları", "Kambiyo Giderleri", "Faktoring Giderleri", "Leasing Giderleri", "Diğer Finansman Giderleri"],
    type: 'other'
  },
  {
    name: "Genel Giderler",
    subcategories: ["Danışmanlık", "Sigorta", "Vergiler", "Yasal Giderler", "Diğer"],
    type: 'other'
  }
];

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const OpexMatrix = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [personnelData, setPersonnelData] = useState<EmployeeSalaryData[]>([]);
  const [matrixData, setMatrixData] = useState<Record<string, Record<number, number>>>({});
  const [loading, setLoading] = useState(false);
  const { data: opexData, upsertOpexMatrix, loading: opexLoading } = useOpexMatrix();
  const { toast } = useToast();

  // Auto-save timeout
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch personnel data for auto-population
  const fetchPersonnelData = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select(`
          department,
          employee_salaries!inner (
            total_employer_cost,
            effective_date
          )
        `)
        .eq('status', 'aktif')
        .order('department');

      if (error) throw error;

      // Group by department and calculate totals
      const departmentTotals = data?.reduce((acc, employee) => {
        const department = employee.department;
        const salary = employee.employee_salaries as any;
        const cost = salary?.total_employer_cost || 0;

        if (!acc[department]) {
          acc[department] = { total_cost: 0, count: 0 };
        }
        acc[department].total_cost += cost;
        acc[department].count += 1;

        return acc;
      }, {} as Record<string, { total_cost: number; count: number }>);

      const personnelDataArray = Object.entries(departmentTotals || {}).map(([department, data]) => ({
        department,
        total_employer_cost: data.total_cost,
        employee_count: data.count
      }));

      setPersonnelData(personnelDataArray);
    } catch (error) {
      console.error('Error fetching personnel data:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Personel verileri yüklenirken hata oluştu",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Transform opex data to matrix format
  useEffect(() => {
    const matrix: Record<string, Record<number, number>> = {};

    opexData.forEach(item => {
      const key = `${item.category}|${item.subcategory || ''}`;
      if (!matrix[key]) {
        matrix[key] = {};
      }
      matrix[key][item.month] = item.amount;
    });

    setMatrixData(matrix);
  }, [opexData]);

  // Fetch data on component mount and year change
  useEffect(() => {
    fetchPersonnelData();
  }, [fetchPersonnelData, selectedYear]);

  // Toggle category expansion
  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  // Toggle subcategory expansion
  const toggleSubcategory = (categoryName: string, subcategory: string) => {
    const key = `${categoryName}|${subcategory}`;
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSubcategories(newExpanded);
  };

  // Auto-save cell value with debounce
  const handleCellChange = (category: string, subcategory: string | null, month: number, value: string) => {
    const amount = parseFloat(value) || 0;
    const key = `${category}|${subcategory || ''}`;
    
    setMatrixData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [month]: amount
      }
    }));

    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout for auto-save
    const newTimeout = setTimeout(async () => {
      try {
        await upsertOpexMatrix(selectedYear, month, category, subcategory, amount);
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 1000);

    setSaveTimeout(newTimeout);
  };

  // Get cell value
  const getCellValue = (category: string, subcategory: string | null, month: number): number => {
    const key = `${category}|${subcategory || ''}`;
    return matrixData[key]?.[month] || 0;
  };

  // Calculate row total
  const getRowTotal = (category: string, subcategory: string | null): number => {
    const key = `${category}|${subcategory || ''}`;
    const row = matrixData[key] || {};
    return Object.values(row).reduce((sum, value) => sum + value, 0);
  };

  // Calculate column total
  const getColumnTotal = (month: number): number => {
    return OPEX_CATEGORIES.reduce((total, category) => {
      return total + getCategoryTotal(category.name, month);
    }, 0);
  };

  // Calculate grand total
  const getGrandTotal = (): number => {
    return MONTHS.reduce((total, _, monthIndex) => {
      return total + getColumnTotal(monthIndex + 1);
    }, 0);
  };

  // Get auto-populated value for personnel expenses
  const getAutoPopulatedValue = (subcategory: string, month: number): number => {
    if (subcategory === "Maaşlar") {
      return personnelData.reduce((sum, dept) => sum + dept.total_employer_cost, 0);
    }
    return 0;
  };

  // Calculate category total (sum of all subcategories in a category)
  const getCategoryTotal = (category: string, month: number): number => {
    const categoryData = OPEX_CATEGORIES.find(c => c.name === category);
    if (!categoryData) return 0;

    return categoryData.subcategories.reduce((total, subcategory) => {
      const cellValue = getCellValue(category, subcategory, month);
      const autoValue = categoryData.isAutoPopulated ? getAutoPopulatedValue(subcategory, month) : 0;
      return total + cellValue + autoValue;
    }, 0);
  };

  // Calculate category row total (sum across all months)
  const getCategoryRowTotal = (category: string): number => {
    return MONTHS.reduce((total, _, monthIndex) => {
      return total + getCategoryTotal(category, monthIndex + 1);
    }, 0);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Export to Excel
  const exportToExcel = () => {
    const csvData = [
      ['Kategori', 'Alt Kategori', ...MONTHS, 'Toplam'],
      ...OPEX_CATEGORIES.flatMap(category => 
        category.subcategories.map(subcategory => [
          category.name,
          subcategory,
          ...MONTHS.map((_, index) => getCellValue(category.name, subcategory, index + 1)),
          getRowTotal(category.name, subcategory)
        ])
      ),
      ['TOPLAM', '', ...MONTHS.map((_, index) => getColumnTotal(index + 1)), getGrandTotal()]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `opex_matrix_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              OPEX Matrix
            </span>
            <div className="flex items-center gap-4">
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={exportToExcel} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Excel'e Aktar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">Kategori</TableHead>
                  <TableHead className="sticky left-[200px] bg-background z-10 min-w-[150px]">Alt Kategori</TableHead>
                  {MONTHS.map((month, index) => (
                    <TableHead key={index} className="text-center min-w-[120px]">{month}</TableHead>
                  ))}
                  <TableHead className="text-center min-w-[120px] font-bold">Toplam</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {OPEX_CATEGORIES.map((category) => (
                  <>
                    <TableRow key={category.name} className="bg-muted/50">
                      <TableCell 
                        className="sticky left-0 bg-muted/50 z-10 font-medium cursor-pointer"
                        onClick={() => toggleCategory(category.name)}
                      >
                        <div className="flex items-center gap-2">
                          {expandedCategories.has(category.name) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          {category.name}
                          {category.isAutoPopulated && (
                            <Badge variant="secondary" className="ml-2">
                              <Users className="h-3 w-3 mr-1" />
                              Auto
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="sticky left-[200px] bg-muted/50 z-10 font-medium">
                        Kategori Toplamı
                      </TableCell>
                      {MONTHS.map((_, monthIndex) => {
                        const month = monthIndex + 1;
                        const total = getCategoryTotal(category.name, month);
                        return (
                          <TableCell key={monthIndex} className="text-center bg-muted/50 font-medium">
                            {formatCurrency(total)}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center bg-muted/50 font-bold">
                        {formatCurrency(getCategoryRowTotal(category.name))}
                      </TableCell>
                    </TableRow>
                    {expandedCategories.has(category.name) && category.subcategories.map((subcategory) => (
                       <React.Fragment key={`${category.name}-${subcategory}`}>
                         <TableRow className="animate-fade-in">
                           <TableCell className="sticky left-0 bg-background z-10"></TableCell>
                           <TableCell className="sticky left-[200px] bg-background z-10">
                             <div className="flex items-center gap-2">
                               <button
                                 onClick={() => toggleSubcategory(category.name, subcategory)}
                                 className="p-0.5 rounded hover:bg-muted/50 transition-colors"
                               >
                                 {expandedSubcategories.has(`${category.name}|${subcategory}`) ? (
                                   <ChevronDown className="h-3 w-3" />
                                 ) : (
                                   <ChevronRight className="h-3 w-3" />
                                 )}
                               </button>
                               <span>{subcategory}</span>
                               {category.isAutoPopulated && (
                                 <Badge variant="outline">Auto</Badge>
                               )}
                             </div>
                           </TableCell>
                           {MONTHS.map((_, monthIndex) => {
                             const month = monthIndex + 1;
                             const value = getCellValue(category.name, subcategory, month);
                             const autoValue = category.isAutoPopulated ? getAutoPopulatedValue(subcategory, month) : 0;
                             
                             return (
                               <TableCell key={monthIndex} className="text-center p-2">
                                 {category.isAutoPopulated ? (
                                   <div className="text-sm font-medium text-muted-foreground">
                                     {formatCurrency(autoValue)}
                                   </div>
                                 ) : (
                                   <Input
                                     type="number"
                                     value={value || ''}
                                     onChange={(e) => handleCellChange(category.name, subcategory, month, e.target.value)}
                                     className="w-full text-center border-0 bg-transparent focus:bg-background"
                                     placeholder="0"
                                   />
                                 )}
                               </TableCell>
                             );
                           })}
                           <TableCell className="text-center font-medium">
                             {formatCurrency(getRowTotal(category.name, subcategory))}
                           </TableCell>
                         </TableRow>
                         
                         {/* Subcategory Details Row */}
                         {expandedSubcategories.has(`${category.name}|${subcategory}`) && (
                           <TableRow className="animate-accordion-down bg-muted/20">
                             <TableCell className="sticky left-0 bg-muted/20 z-10"></TableCell>
                             <TableCell className="sticky left-[200px] bg-muted/20 z-10">
                               <div className="text-xs text-muted-foreground pl-6">
                                 Detaylar
                               </div>
                             </TableCell>
                             {MONTHS.map((_, monthIndex) => {
                               const month = monthIndex + 1;
                               const value = getCellValue(category.name, subcategory, month);
                               
                               return (
                                 <TableCell key={monthIndex} className="text-center p-2 bg-muted/20">
                                   <div className="text-xs space-y-1">
                                     <div className="font-medium">
                                       {formatCurrency(value)}
                                     </div>
                                     <div className="text-muted-foreground">
                                       {value > 0 ? `${month}/${selectedYear}` : 'Boş'}
                                     </div>
                                   </div>
                                 </TableCell>
                               );
                             })}
                             <TableCell className="text-center bg-muted/20">
                               <div className="text-xs text-muted-foreground">
                                 Yıllık Toplam
                               </div>
                             </TableCell>
                           </TableRow>
                         )}
                       </React.Fragment>
                    ))}
                  </>
                ))}
                
                 {/* Total Row - Always visible */}
                <TableRow className="bg-primary/10 font-bold border-t-2 border-primary">
                  <TableCell className="sticky left-0 bg-primary/10 z-10">TOPLAM</TableCell>
                  <TableCell className="sticky left-[200px] bg-primary/10 z-10"></TableCell>
                  {MONTHS.map((_, monthIndex) => (
                    <TableCell key={monthIndex} className="text-center bg-primary/10">
                      {formatCurrency(getColumnTotal(monthIndex + 1))}
                    </TableCell>
                  ))}
                  <TableCell className="text-center bg-primary/10">
                    {formatCurrency(getGrandTotal())}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          {(loading || opexLoading) && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Yükleniyor...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OpexMatrix;