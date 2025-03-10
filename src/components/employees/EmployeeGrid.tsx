
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Edit, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import type { Employee } from "./types";

interface EmployeeGridProps {
  employees: Employee[];
  isLoading: boolean;
}

export const EmployeeGrid = ({ employees, isLoading }: EmployeeGridProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden border border-gray-100 shadow-sm">
            <div className="h-40 flex items-center justify-center bg-gray-50">
              <Skeleton className="h-20 w-20 rounded-full" />
            </div>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
            <CardFooter className="flex justify-between p-4 pt-0">
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <Card className="p-8 text-center bg-white shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="h-12 w-12 text-gray-400" />
          <h2 className="text-xl font-medium text-gray-800">Çalışan bulunamadı</h2>
          <p className="text-gray-600 max-w-md">
            Arama kriterlerinize uygun çalışan bulunamadı. Lütfen filtrelerinizi değiştirerek tekrar deneyin.
          </p>
        </div>
      </Card>
    );
  }

  const handleViewDetails = (employeeId: string) => {
    navigate(`/employees/${employeeId}`);
  };

  const handleEdit = (employeeId: string) => {
    navigate(`/employees/${employeeId}/edit`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {employees.map((employee) => (
        <Card key={employee.id} className="overflow-hidden border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200">
          <div className="h-40 flex items-center justify-center bg-gradient-to-b from-primary/5 to-primary/10">
            <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
              <AvatarImage src={employee.avatar_url || undefined} alt={`${employee.first_name} ${employee.last_name}`} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {employee.first_name[0]}
                {employee.last_name[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardContent className="p-4">
            <div className="text-center mb-3">
              <h3 className="font-semibold text-lg">
                {employee.first_name} {employee.last_name}
              </h3>
              <p className="text-gray-500 text-sm">{employee.position}</p>
            </div>
            <div className="flex flex-col space-y-2 mt-4">
              <p className="text-sm flex justify-between items-center">
                <span className="text-gray-500">Departman:</span>
                <span className="font-medium">{employee.department}</span>
              </p>
              <p className="text-sm flex justify-between items-center">
                <span className="text-gray-500">Durum:</span>
                <StatusBadge status={employee.status} />
              </p>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-2 flex justify-between border-t border-gray-100">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDetails(employee.id)}
              className="flex items-center space-x-1"
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              Detay
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(employee.id)}
              className="flex items-center space-x-1"
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Düzenle
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
