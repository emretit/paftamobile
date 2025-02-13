
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, Calendar, BadgeCheck } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { Employee } from "./types";

interface EmployeeGridProps {
  employees: Employee[];
}

export const EmployeeGrid = ({ employees }: EmployeeGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {employees.map((employee) => (
        <Card key={employee.id}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center mb-4">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarImage src={employee.avatar_url || undefined} />
                <AvatarFallback>{employee.first_name[0]}{employee.last_name[0]}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold">{employee.first_name} {employee.last_name}</h3>
              <p className="text-sm text-gray-500">{employee.position}</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                {employee.department}
              </div>
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                {employee.email}
              </div>
              {employee.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  {employee.phone}
                </div>
              )}
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                {new Date(employee.hire_date).toLocaleDateString('tr-TR')}
              </div>
              <div className="flex items-center text-sm">
                <BadgeCheck className="h-4 w-4 mr-2 text-gray-500" />
                <StatusBadge status={employee.status} />
              </div>
              <div className="pt-4 flex justify-center gap-2">
                <Button variant="outline" size="sm">Detaylar</Button>
                <Button variant="outline" size="sm">Düzenle</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
