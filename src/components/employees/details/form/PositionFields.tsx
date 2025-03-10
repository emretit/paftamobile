
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { POSITIONS } from "../../form/types";
import type { Department } from "../../form/types";

interface PositionFieldsProps {
  formData: {
    position: string;
    department: string;
  };
  departments: Department[];
  shouldShowDepartment: boolean;
  handleInputChange: (field: string, value: string) => void;
}

export const PositionFields = ({ 
  formData, 
  departments, 
  shouldShowDepartment, 
  handleInputChange 
}: PositionFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="position">Pozisyon</Label>
        <Select
          value={formData.position}
          onValueChange={(value) => {
            handleInputChange('position', value);
            if (value === 'Admin') {
              handleInputChange('department', '');
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pozisyon seçin" />
          </SelectTrigger>
          <SelectContent>
            {POSITIONS.map((position) => (
              <SelectItem key={position} value={position}>
                {position}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {shouldShowDepartment && (
        <div className="space-y-2">
          <Label htmlFor="department">Departman</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleInputChange('department', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Departman seçin" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.name}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
};
