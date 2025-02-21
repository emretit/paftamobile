
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Pencil, Eye } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { Employee } from "./types";

interface EmployeeGridProps {
  employees: Employee[];
}

export const EmployeeGrid = ({ employees }: EmployeeGridProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {employees.map((employee) => (
        <Card key={employee.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <Avatar className="h-12 w-12">
                {employee.avatar_url ? (
                  <AvatarImage src={employee.avatar_url} alt={`${employee.first_name} ${employee.last_name}`} />
                ) : null}
                <AvatarFallback>{employee.first_name[0]}{employee.last_name[0]}</AvatarFallback>
              </Avatar>
              <StatusBadge status={employee.status} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-semibold">{employee.first_name} {employee.last_name}</h3>
              <p className="text-sm text-gray-500">{employee.position}</p>
              <p className="text-sm text-gray-500">{employee.department}</p>
              <p className="text-sm text-gray-500">{employee.email}</p>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => navigate(`/employees/details/${employee.id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Detay
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => navigate(`/employees/edit/${employee.id}`)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
