
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  MapPin, 
  User, 
  Heart, 
  Clock, 
  CreditCard, 
  UserCheck,
  Flag
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Employee } from "@/types/employee";

interface EmployeeDetailsViewProps {
  employee: Employee;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  refetch: () => void;
}

export const EmployeeDetailsView = ({ 
  employee, 
  isLoading, 
  activeTab, 
  setActiveTab, 
  refetch 
}: EmployeeDetailsViewProps) => {
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  const getStatusColor = (status: string) => {
    return status === "aktif" 
      ? "bg-green-100 text-green-800 border-green-200" 
      : "bg-red-100 text-red-800 border-red-200";
  };

  const getInitials = () => {
    return `${employee.first_name.charAt(0)}${employee.last_name.charAt(0)}`;
  };

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
                  {getInitials()}
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
                  <Badge variant={employee.status === 'aktif' ? 'default' : 'secondary'} className={`capitalize ${getStatusColor(employee.status)}`}>
                    {employee.status === 'aktif' ? 'Aktif' : 'Pasif'}
                  </Badge>
                  <span className="text-sm text-gray-500 flex items-center">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {employee.city || employee.country || 'Konum Bilgisi Yok'}
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

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
          <TabsTrigger value="personal">Kişisel Bilgiler</TabsTrigger>
          <TabsTrigger value="employment">İş Bilgileri</TabsTrigger>
          <TabsTrigger value="contact">İletişim Bilgileri</TabsTrigger>
          <TabsTrigger value="emergency">Acil Durum</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" />
                Temel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ad</p>
                  <p className="font-medium">{employee.first_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Soyad</p>
                  <p className="font-medium">{employee.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ID/SSN</p>
                  <p className="font-medium">{employee.id_ssn || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Durum</p>
                  <p className="font-medium">
                    <Badge className={getStatusColor(employee.status)}>
                      {employee.status === 'aktif' ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-primary" />
                Pozisyon
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Departman</p>
                  <p className="font-medium">{employee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pozisyon</p>
                  <p className="font-medium">{employee.position}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">İşe Başlama Tarihi</p>
                  <p className="font-medium">{formatDate(employee.hire_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" />
                Kişisel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Doğum Tarihi</p>
                  <p className="font-medium">{formatDate(employee.date_of_birth)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cinsiyet</p>
                  <p className="font-medium">{employee.gender || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Medeni Durum</p>
                  <p className="font-medium">{employee.marital_status || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kimlik/SSN</p>
                  <p className="font-medium">{employee.id_ssn || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Adres Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Adres</p>
                  <p className="font-medium">{employee.address || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ülke</p>
                  <p className="font-medium">{employee.country || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Şehir</p>
                  <p className="font-medium">{employee.city || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">İlçe</p>
                  <p className="font-medium">{employee.district || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Posta Kodu</p>
                  <p className="font-medium">{employee.postal_code || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employment" className="grid grid-cols-1 gap-6">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <Building className="h-5 w-5 mr-2 text-primary" />
                İş ve Çalışma Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Departman</p>
                  <p className="font-medium">{employee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pozisyon</p>
                  <p className="font-medium">{employee.position}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">İşe Başlama Tarihi</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    {formatDate(employee.hire_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Çalışma Süresi</p>
                  <p className="font-medium">
                    {Math.floor((new Date().getTime() - new Date(employee.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} ay
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Durum</p>
                  <p className="font-medium">
                    <Badge className={getStatusColor(employee.status)}>
                      {employee.status === 'aktif' ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="grid grid-cols-1 gap-6">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <Phone className="h-5 w-5 mr-2 text-primary" />
                İletişim Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">E-posta</p>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="font-medium">{employee.phone || "-"}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tam Adres</p>
                    <p className="font-medium">
                      {employee.address ? 
                        `${employee.address}${employee.district ? ', ' + employee.district : ''}${employee.city ? ', ' + employee.city : ''}${employee.country ? ', ' + employee.country : ''}` 
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="grid grid-cols-1 gap-6">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-primary" />
                Acil Durum İrtibat Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {(employee.emergency_contact_name || employee.emergency_contact_phone) ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Ad Soyad</p>
                    <p className="font-medium">{employee.emergency_contact_name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="font-medium">{employee.emergency_contact_phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">İlişki</p>
                    <p className="font-medium">{employee.emergency_contact_relation || "-"}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Flag className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Acil durum irtibat bilgisi henüz eklenmemiş</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
