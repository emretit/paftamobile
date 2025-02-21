
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EmployeeFormData } from "./types";

interface PersonalInfoProps {
  formData: EmployeeFormData;
  onFormChange: (field: keyof EmployeeFormData, value: string) => void;
}

export const PersonalInfo = ({ formData, onFormChange }: PersonalInfoProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => onFormChange('first_name', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => onFormChange('last_name', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onFormChange('email', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => onFormChange('phone', e.target.value)}
          placeholder="+1 234 567 8900"
        />
      </div>
    </>
  );
};
