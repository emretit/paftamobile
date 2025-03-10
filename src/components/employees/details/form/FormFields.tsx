
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Employee } from "../../types";

interface FormFieldsProps {
  formData: Partial<Employee>;
  departments: { name: string }[];
  handleInputChange?: (field: string, value: string) => void;
  isEditing?: boolean;
  showExtendedInfo?: boolean;
}

export const FormFields = ({ 
  formData, 
  departments, 
  handleInputChange, 
  isEditing = false,
  showExtendedInfo = false
}: FormFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="first_name">Ad</Label>
          {isEditing ? (
            <Input
              id="first_name"
              value={formData.first_name || ''}
              onChange={(e) => handleInputChange?.('first_name', e.target.value)}
              required
            />
          ) : (
            <div className="p-2 bg-gray-50 rounded-md">{formData.first_name}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Soyad</Label>
          {isEditing ? (
            <Input
              id="last_name"
              value={formData.last_name || ''}
              onChange={(e) => handleInputChange?.('last_name', e.target.value)}
              required
            />
          ) : (
            <div className="p-2 bg-gray-50 rounded-md">{formData.last_name}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          {isEditing ? (
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange?.('email', e.target.value)}
              required
            />
          ) : (
            <div className="p-2 bg-gray-50 rounded-md">{formData.email}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          {isEditing ? (
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange?.('phone', e.target.value)}
            />
          ) : (
            <div className="p-2 bg-gray-50 rounded-md">{formData.phone || '-'}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Departman</Label>
          {isEditing ? (
            <Select
              value={formData.department}
              onValueChange={(value) => handleInputChange?.('department', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Departman seçin" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.name} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-2 bg-gray-50 rounded-md">{formData.department}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Pozisyon</Label>
          {isEditing ? (
            <Input
              id="position"
              value={formData.position || ''}
              onChange={(e) => handleInputChange?.('position', e.target.value)}
              required
            />
          ) : (
            <div className="p-2 bg-gray-50 rounded-md">{formData.position}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hire_date">İşe Başlama Tarihi</Label>
          {isEditing ? (
            <Input
              id="hire_date"
              type="date"
              value={formData.hire_date || ''}
              onChange={(e) => handleInputChange?.('hire_date', e.target.value)}
              required
            />
          ) : (
            <div className="p-2 bg-gray-50 rounded-md">
              {new Date(formData.hire_date || '').toLocaleDateString('tr-TR')}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Durum</Label>
          {isEditing ? (
            <Select
              value={formData.status}
              onValueChange={(value: 'active' | 'inactive') => 
                handleInputChange?.('status', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="p-2 bg-gray-50 rounded-md">
              {formData.status === 'active' ? 'Aktif' : 'Pasif'}
            </div>
          )}
        </div>
      </div>

      {/* Extended personal information section */}
      {showExtendedInfo && (
        <>
          <h4 className="text-lg font-medium text-gray-700 mt-8 mb-4">Kişisel Bilgiler</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Doğum Tarihi</Label>
              {isEditing ? (
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => handleInputChange?.('date_of_birth', e.target.value)}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-md">
                  {formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString('tr-TR') : '-'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Cinsiyet</Label>
              {isEditing ? (
                <Select
                  value={formData.gender || ''}
                  onValueChange={(value) => handleInputChange?.('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cinsiyet seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Erkek</SelectItem>
                    <SelectItem value="female">Kadın</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-gray-50 rounded-md">{formData.gender || '-'}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="marital_status">Medeni Durum</Label>
              {isEditing ? (
                <Select
                  value={formData.marital_status || ''}
                  onValueChange={(value) => handleInputChange?.('marital_status', value)}
                >
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
              ) : (
                <div className="p-2 bg-gray-50 rounded-md">{formData.marital_status || '-'}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_ssn">TC Kimlik No / SSN</Label>
              {isEditing ? (
                <Input
                  id="id_ssn"
                  value={formData.id_ssn || ''}
                  onChange={(e) => handleInputChange?.('id_ssn', e.target.value)}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-md">{formData.id_ssn || '-'}</div>
              )}
            </div>
          </div>

          <h4 className="text-lg font-medium text-gray-700 mt-8 mb-4">Adres Bilgileri</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Adres</Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange?.('address', e.target.value)}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-md">{formData.address || '-'}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Şehir</Label>
              {isEditing ? (
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange?.('city', e.target.value)}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-md">{formData.city || '-'}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Posta Kodu</Label>
              {isEditing ? (
                <Input
                  id="postal_code"
                  value={formData.postal_code || ''}
                  onChange={(e) => handleInputChange?.('postal_code', e.target.value)}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-md">{formData.postal_code || '-'}</div>
              )}
            </div>
          </div>

          <h4 className="text-lg font-medium text-gray-700 mt-8 mb-4">Acil Durum İletişim Bilgileri</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">İletişim Kişisi</Label>
              {isEditing ? (
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name || ''}
                  onChange={(e) => handleInputChange?.('emergency_contact_name', e.target.value)}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-md">{formData.emergency_contact_name || '-'}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_relation">Yakınlık Derecesi</Label>
              {isEditing ? (
                <Input
                  id="emergency_contact_relation"
                  value={formData.emergency_contact_relation || ''}
                  onChange={(e) => handleInputChange?.('emergency_contact_relation', e.target.value)}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-md">{formData.emergency_contact_relation || '-'}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">Telefon</Label>
              {isEditing ? (
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone || ''}
                  onChange={(e) => handleInputChange?.('emergency_contact_phone', e.target.value)}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-md">{formData.emergency_contact_phone || '-'}</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
