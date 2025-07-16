import { useState, useEffect } from "react";
import { Employee } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, User, MapPin, Phone, Mail, Building, Camera, Save, X, History, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmployeeEditFormProps {
  employee: Employee;
  onSave: (updatedEmployee: Partial<Employee>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const EmployeeEditForm = ({ employee, onSave, onCancel, isSaving = false }: EmployeeEditFormProps) => {
  const [formData, setFormData] = useState<Partial<Employee>>(employee);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(employee.status === 'aktif');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [changeLog, setChangeLog] = useState<string>('');
  const { toast } = useToast();

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      const { data } = await supabase
        .from('departments')
        .select('name')
        .order('name');
      
      const deptNames = data?.map(d => d.name) || [
        "Mühendislik", "Satış", "Pazarlama", "Finans", "İnsan Kaynakları", "Operasyon", "Muhasebe"
      ];
      setDepartments(deptNames);
    };
    fetchDepartments();
  }, []);

  const handleInputChange = (field: keyof Employee, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: keyof Employee, date: Date | undefined) => {
    if (date) {
      handleInputChange(field, date.toISOString().split('T')[0]);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const updatedData: Partial<Employee> = {
      ...formData,
      status: isActive ? 'aktif' : 'pasif',
      updated_at: new Date().toISOString(),
    };

    // Add change log entry
    if (changeLog.trim()) {
      // Here you could save the change log to a separate table
      console.log('Change log:', changeLog);
    }

    onSave(updatedData);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  const departments_list = [
    "Mühendislik",
    "Satış", 
    "Pazarlama",
    "Finans",
    "İnsan Kaynakları",
    "Operasyon",
    "Muhasebe",
    "Bilgi İşlem",
    "Kalite",
    "Üretim"
  ];

  const positions = [
    "Müdür",
    "Müdür Yardımcısı", 
    "Uzman",
    "Kıdemli Uzman",
    "Analist",
    "Koordinatör",
    "Temsilci",
    "Asistan",
    "Teknisyen",
    "Operatör"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={imagePreview || employee.avatar_url || ''} />
                  <AvatarFallback className="text-lg">
                    {getInitials(employee.first_name, employee.last_name)}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="h-3 w-3" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Edit3 className="h-6 w-6" />
                  {employee.first_name} {employee.last_name}
                </h2>
                <p className="text-gray-600">{employee.position} - {employee.department}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Aktif" : "Pasif"}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    İşe Giriş: {employee.hire_date ? format(new Date(employee.hire_date), 'dd MMMM yyyy', { locale: tr }) : 'Belirtilmemiş'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                id="employee-status"
              />
              <Label htmlFor="employee-status">Aktif Çalışan</Label>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Kişisel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Ad *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Ad"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Soyad *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Soyad"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-posta *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="ornek@sirket.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+90 555 123 45 67"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date_of_birth">Doğum Tarihi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date_of_birth && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date_of_birth ? format(new Date(formData.date_of_birth), 'dd MMMM yyyy', { locale: tr }) : "Tarih seçin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formatDate(formData.date_of_birth)}
                      onSelect={(date) => handleDateChange('date_of_birth', date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="gender">Cinsiyet</Label>
                <Select value={formData.gender || ''} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cinsiyet seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Erkek</SelectItem>
                    <SelectItem value="female">Kadın</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="marital_status">Medeni Durum</Label>
              <Select value={formData.marital_status || ''} onValueChange={(value) => handleInputChange('marital_status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Medeni durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Bekar</SelectItem>
                  <SelectItem value="married">Evli</SelectItem>
                  <SelectItem value="divorced">Boşanmış</SelectItem>
                  <SelectItem value="widowed">Dul</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="id_ssn">TC Kimlik No</Label>
              <Input
                id="id_ssn"
                value={formData.id_ssn || ''}
                onChange={(e) => handleInputChange('id_ssn', e.target.value)}
                placeholder="12345678901"
                maxLength={11}
              />
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              İş Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="department">Departman *</Label>
              <Select value={formData.department || ''} onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Departman seçin" />
                </SelectTrigger>
                <SelectContent>
                  {departments_list.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="position">Pozisyon *</Label>
              <Select value={formData.position || ''} onValueChange={(value) => handleInputChange('position', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pozisyon seçin" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="hire_date">İşe Giriş Tarihi *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.hire_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.hire_date ? format(new Date(formData.hire_date), 'dd MMMM yyyy', { locale: tr }) : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formatDate(formData.hire_date)}
                    onSelect={(date) => handleDateChange('hire_date', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="status">Çalışma Durumu</Label>
              <Select value={isActive ? 'aktif' : 'pasif'} onValueChange={(value) => setIsActive(value === 'aktif')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="pasif">Pasif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adres Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Adres</Label>
              <Textarea
                id="address"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Tam adres bilgisi"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Şehir</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="İstanbul"
                />
              </div>
              <div>
                <Label htmlFor="district">İlçe</Label>
                <Input
                  id="district"
                  value={formData.district || ''}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  placeholder="Beşiktaş"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postal_code">Posta Kodu</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code || ''}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  placeholder="34000"
                />
              </div>
              <div>
                <Label htmlFor="country">Ülke</Label>
                <Input
                  id="country"
                  value={formData.country || 'Turkey'}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Turkey"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Acil Durum İletişim
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="emergency_contact_name">Ad Soyad</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name || ''}
                onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                placeholder="Acil durum kişisi adı"
              />
            </div>

            <div>
              <Label htmlFor="emergency_contact_phone">Telefon</Label>
              <Input
                id="emergency_contact_phone"
                value={formData.emergency_contact_phone || ''}
                onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                placeholder="+90 555 123 45 67"
              />
            </div>

            <div>
              <Label htmlFor="emergency_contact_relation">Yakınlık</Label>
              <Select value={formData.emergency_contact_relation || ''} onValueChange={(value) => handleInputChange('emergency_contact_relation', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Yakınlık derecesi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Anne/Baba</SelectItem>
                  <SelectItem value="spouse">Eş</SelectItem>
                  <SelectItem value="sibling">Kardeş</SelectItem>
                  <SelectItem value="child">Çocuk</SelectItem>
                  <SelectItem value="friend">Arkadaş</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Değişiklik Notu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={changeLog}
            onChange={(e) => setChangeLog(e.target.value)}
            placeholder="Bu güncelleme ile ilgili notlarınızı buraya yazabilirsiniz..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          <X className="h-4 w-4 mr-2" />
          İptal
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Değişiklikleri Kaydet
            </>
          )}
        </Button>
      </div>
    </div>
  );
};