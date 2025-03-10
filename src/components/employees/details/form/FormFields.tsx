
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Employee } from "../../types";

interface FormFieldsProps {
  formData: Partial<Employee>;
  departments: { name: string }[];
  handleInputChange?: (field: string, value: string) => void;
  isEditing?: boolean;
}

export const FormFields = ({ 
  formData, 
  departments, 
  handleInputChange, 
  isEditing = false 
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
    </div>
  );
};
