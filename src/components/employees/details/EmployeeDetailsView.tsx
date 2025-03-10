
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, Phone, Briefcase, Building } from "lucide-react";
import type { Employee } from "../types";

interface EmployeeDetailsViewProps {
  employee: Employee;
}

export const EmployeeDetailsView = ({ employee }: EmployeeDetailsViewProps) => {
  return (
    <div className="space-y-6">
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-2 border-primary/10">
                <AvatarImage src={employee.avatar_url || undefined} alt={`${employee.first_name} ${employee.last_name}`} />
                <AvatarFallback className="text-2xl bg-primary/5 text-primary">
                  {employee.first_name[0]}
                  {employee.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">
                  {employee.first_name} {employee.last_name}
                </h2>
                <p className="text-gray-500">{employee.position}</p>
                <div className="mt-2">
                  <Badge variant={employee.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                    {employee.status === 'active' ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Mail className="h-5 w-5 mr-2 text-primary" />
              Kişisel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">E-posta</p>
              <p className="text-sm font-medium">{employee.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Telefon</p>
              <p className="text-sm font-medium">{employee.phone || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">İşe Başlama Tarihi</p>
              <p className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                {new Date(employee.hire_date).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Building className="h-5 w-5 mr-2 text-primary" />
              Departman Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Departman</p>
              <p className="text-sm font-medium flex items-center">
                <Building className="h-4 w-4 mr-2 text-gray-400" />
                {employee.department}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pozisyon</p>
              <p className="text-sm font-medium flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                {employee.position}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
