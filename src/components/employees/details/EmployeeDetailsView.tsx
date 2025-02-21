
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Employee } from "../types";

interface EmployeeDetailsViewProps {
  employee: Employee;
}

export const EmployeeDetailsView = ({ employee }: EmployeeDetailsViewProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={employee.avatar_url || undefined} />
                <AvatarFallback>
                  {employee.first_name[0]}
                  {employee.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">
                  {employee.first_name} {employee.last_name}
                </h2>
                <p className="text-gray-500">{employee.position}</p>
                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                  {employee.status === 'active' ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kişisel Bilgiler</CardTitle>
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
              <p className="text-sm font-medium">
                {new Date(employee.hire_date).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Departman Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Departman</p>
              <p className="text-sm font-medium">{employee.department}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pozisyon</p>
              <p className="text-sm font-medium">{employee.position}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
