
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, TrendingUp, BarChart2, Plus } from "lucide-react";
import type { Employee, EmployeeSalary } from "@/types/employee";
import { useToast } from "@/components/ui/use-toast";

interface EmployeeSalaryTabProps {
  employee: Employee;
}

export const EmployeeSalaryTab = ({ employee }: EmployeeSalaryTabProps) => {
  const { toast } = useToast();
  
  const { data: salaries = [], isLoading } = useQuery({
    queryKey: ["employee-salaries", employee.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_salaries")
        .select("*")
        .eq("employee_id", employee.id)
        .order("effective_date", { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Maaş bilgileri yüklenirken bir sorun oluştu",
        });
        return [];
      }

      return data as EmployeeSalary[];
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {salaries.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  Güncel Brüt Maaş
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(salaries[0].gross_salary)}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(salaries[0].effective_date)} tarihinden itibaren geçerli
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Net Maaş
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(salaries[0].net_salary)}</p>
                <p className="text-sm text-gray-500">
                  Vergi ve kesintiler sonrası
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                  Maaş Geçmişi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{salaries.length}</p>
                <p className="text-sm text-gray-500">
                  Toplam maaş değişikliği kaydı
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b pb-3 flex flex-row justify-between items-center">
              <CardTitle className="text-lg font-medium">Maaş Geçmişi</CardTitle>
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                <Plus className="mr-2 h-4 w-4" />
                Yeni Maaş Ekle
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Geçerlilik Tarihi</TableHead>
                    <TableHead>Brüt Maaş</TableHead>
                    <TableHead>Net Maaş</TableHead>
                    <TableHead>Ek Ödemeler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaries.map((salary) => (
                    <TableRow key={salary.id}>
                      <TableCell className="font-medium">
                        {formatDate(salary.effective_date)}
                      </TableCell>
                      <TableCell>{formatCurrency(salary.gross_salary)}</TableCell>
                      <TableCell>{formatCurrency(salary.net_salary)}</TableCell>
                      <TableCell>
                        {Object.keys(salary.allowances || {}).length > 0
                          ? Object.entries(salary.allowances || {}).map(([key, value]) => (
                              <div key={key}>
                                {key}: {formatCurrency(value as number)}
                              </div>
                            ))
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <DollarSign className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">Maaş Bilgisi Bulunamadı</h3>
            <p className="text-gray-500 mb-6 text-center">
              Bu çalışan için kayıtlı bir maaş bilgisi bulunmuyor.
            </p>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Maaş Bilgisi Ekle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
