
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Edit } from "lucide-react";
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
          <Card key={index} className="overflow-hidden">
            <div className="h-40 flex items-center justify-center bg-gray-100">
              <Skeleton className="h-20 w-20 rounded-full" />
            </div>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Çalışan bulunamadı.</p>
      </div>
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
        <Card key={employee.id} className="overflow-hidden">
          <div className="h-40 flex items-center justify-center bg-gray-100">
            <Avatar className="h-24 w-24">
              <AvatarImage src={employee.avatar_url || undefined} />
              <AvatarFallback className="text-xl">
                {employee.first_name[0]}
                {employee.last_name[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardContent className="p-4 space-y-2">
            <div className="text-center">
              <h3 className="font-semibold text-lg">
                {employee.first_name} {employee.last_name}
              </h3>
              <p className="text-gray-500 text-sm">{employee.position}</p>
            </div>
            <div className="flex flex-col space-y-1">
              <p className="text-sm flex justify-between">
                <span className="text-gray-500">Departman:</span>
                <span className="font-medium">{employee.department}</span>
              </p>
              <p className="text-sm flex justify-between">
                <span className="text-gray-500">Durum:</span>
                <StatusBadge status={employee.status} />
              </p>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDetails(employee.id)}
              className="flex items-center space-x-1"
            >
              <Eye className="h-3 w-3 mr-1" />
              Detay
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(employee.id)}
              className="flex items-center space-x-1"
            >
              <Edit className="h-3 w-3 mr-1" />
              Düzenle
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
