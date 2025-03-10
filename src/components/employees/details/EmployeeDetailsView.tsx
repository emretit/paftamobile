
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, Phone, Briefcase, Building, MapPin, User, Heart, Clock } from "lucide-react";
import type { Employee } from "../types";

interface EmployeeDetailsViewProps {
  employee: Employee;
}

export const EmployeeDetailsView = ({ employee }: EmployeeDetailsViewProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-0 shadow-md bg-gradient-to-r from-white to-gray-50/80 overflow-hidden">
        <CardHeader className="pb-4 relative">
          <div className="absolute inset-0 bg-primary/5 h-24 -z-10"></div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-10 z-10 gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                <AvatarImage src={employee.avatar_url || undefined} alt={`${employee.first_name} ${employee.last_name}`} />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  {employee.first_name[0]}
                  {employee.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {employee.first_name} {employee.last_name}
                </h2>
                <p className="text-gray-600 flex items-center mt-1">
                  <Briefcase className="h-4 w-4 mr-2 text-primary" />
                  {employee.position}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Badge variant={employee.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                    {employee.status === 'active' ? 'Aktif' : 'Pasif'}
                  </Badge>
                  <span className="text-sm text-gray-500 flex items-center">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    İstanbul, Türkiye
                  </span>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {Math.floor((new Date().getTime() - new Date(employee.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} ay
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-2 md:mt-0">
              <Badge variant="outline" className="bg-white text-primary border-primary hover:bg-primary/5 transition-colors flex items-center gap-1 px-3 py-1">
                <Heart className="h-3 w-3" />
                <span>Çalışan Profili</span> 
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-lg flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              Kişisel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Mail className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">E-posta</p>
                <p className="text-sm font-medium">{employee.email}</p>
              </div>
            </div>
            <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Phone className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Telefon</p>
                <p className="text-sm font-medium">{employee.phone || "-"}</p>
              </div>
            </div>
            <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">İşe Başlama Tarihi</p>
                <p className="text-sm font-medium">
                  {new Date(employee.hire_date).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-lg flex items-center">
              <Building className="h-5 w-5 mr-2 text-primary" />
              Departman Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Building className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Departman</p>
                <p className="text-sm font-medium">{employee.department}</p>
              </div>
            </div>
            <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Briefcase className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Pozisyon</p>
                <p className="text-sm font-medium">{employee.position}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
