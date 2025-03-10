
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfoFieldsProps {
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

export const PersonalInfoFields = ({ formData, handleInputChange }: PersonalInfoFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="first_name">Adı</Label>
        <Input
          id="first_name"
          value={formData.first_name}
          onChange={(e) => handleInputChange('first_name', e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="last_name">Soyadı</Label>
        <Input
          id="last_name"
          value={formData.last_name}
          onChange={(e) => handleInputChange('last_name', e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          readOnly
          className="bg-gray-100"
        />
        <p className="text-xs text-gray-500">E-posta adresi değiştirilemez.</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Telefon</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="+90 500 000 0000"
        />
      </div>
    </>
  );
};
