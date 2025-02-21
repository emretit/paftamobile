
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EmployeeFormData } from "./types";

interface StatusInfoProps {
  formData: EmployeeFormData;
  onFormChange: (field: keyof EmployeeFormData, value: string) => void;
}

export const StatusInfo = ({ formData, onFormChange }: StatusInfoProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="hire_date">Start Date</Label>
        <Input
          id="hire_date"
          type="date"
          value={formData.hire_date}
          onChange={(e) => onFormChange('hire_date', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value: 'active' | 'inactive') => onFormChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
