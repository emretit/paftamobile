
import { useState } from "react";
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
import { CalendarDays, Calendar, Plus, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Employee, EmployeeLeave } from "@/types/employee";
import { useToast } from "@/components/ui/use-toast";

interface EmployeeLeaveTabProps {
  employee: Employee;
}

export const EmployeeLeaveTab = ({ employee }: EmployeeLeaveTabProps) => {
  const { toast } = useToast();
  
  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ["employee-leaves", employee.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_leaves")
        .select("*")
        .eq("employee_id", employee.id)
        .order("start_date", { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "İzin bilgileri yüklenirken bir sorun oluştu",
        });
        return [];
      }

      return data as EmployeeLeave[];
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Onaylandı</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Bekliyor</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Reddedildi</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  const getLeaveTypeName = (type: string) => {
    switch (type) {
      case "annual":
        return "Yıllık İzin";
      case "sick":
        return "Rapor";
      case "parental":
        return "Doğum İzni";
      case "unpaid":
        return "Ücretsiz İzin";
      case "bereavement":
        return "Özel İzin";
      default:
        return type;
    }
  };

  // Calculate annual leave balance (this would typically come from the backend)
  const calculateLeaveBalance = () => {
    // Example calculation - in a real app this should come from backend
    const yearsSinceHire = Math.floor(
      (new Date().getTime() - new Date(employee.hire_date).getTime()) / 
      (1000 * 60 * 60 * 24 * 365)
    );
    
    // Turkish labor law example: 1-5 years = 14 days, 5-15 years = 20 days, 15+ years = 26 days
    let annualAllowance = 14;
    if (yearsSinceHire >= 15) {
      annualAllowance = 26;
    } else if (yearsSinceHire >= 5) {
      annualAllowance = 20;
    }
    
    // Calculate used leave days
    const usedLeaveDays = leaves
      .filter(leave => leave.leave_type === "annual" && leave.status === "approved")
      .reduce((total, leave) => {
        return total + calculateDuration(leave.start_date, leave.end_date);
      }, 0);
    
    return {
      total: annualAllowance,
      used: usedLeaveDays,
      remaining: annualAllowance - usedLeaveDays
    };
  };

  const leaveBalance = calculateLeaveBalance();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Kalan Yıllık İzin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold">{leaveBalance.remaining}</p>
              <p className="text-sm text-gray-500 ml-2">gün</p>
            </div>
            <p className="text-sm text-gray-500">
              Toplam: {leaveBalance.total} gün
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-primary" />
              Kullanılan İzin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold">{leaveBalance.used}</p>
              <p className="text-sm text-gray-500 ml-2">gün</p>
            </div>
            <p className="text-sm text-gray-500">
              Bu yıl içinde
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <RefreshCw className="h-5 w-5 mr-2 text-primary" />
              Toplam İzin Kaydı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold">{leaves.length}</p>
              <p className="text-sm text-gray-500 ml-2">kayıt</p>
            </div>
            <p className="text-sm text-gray-500">
              Tüm izin türleri
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="border-b pb-3 flex flex-row justify-between items-center">
          <CardTitle className="text-lg font-medium">İzin Geçmişi</CardTitle>
          <Button size="sm" className="bg-red-600 hover:bg-red-700">
            <Plus className="mr-2 h-4 w-4" />
            Yeni İzin Ekle
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {leaves.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İzin Türü</TableHead>
                  <TableHead>Başlangıç</TableHead>
                  <TableHead>Bitiş</TableHead>
                  <TableHead>Süre</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Sebep</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">
                      {getLeaveTypeName(leave.leave_type)}
                    </TableCell>
                    <TableCell>{formatDate(leave.start_date)}</TableCell>
                    <TableCell>{formatDate(leave.end_date)}</TableCell>
                    <TableCell>
                      {calculateDuration(leave.start_date, leave.end_date)} gün
                    </TableCell>
                    <TableCell>{getStatusBadge(leave.status)}</TableCell>
                    <TableCell className="max-w-xs truncate" title={leave.reason || ""}>
                      {leave.reason || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                İzin Kaydı Bulunamadı
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                Bu çalışan için kayıtlı bir izin bilgisi bulunmuyor.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
