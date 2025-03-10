
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StatusFieldsProps {
  formData: {
    hire_date: string;
    status: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

export const StatusFields = ({ formData, handleInputChange }: StatusFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="hire_date">İşe Başlama Tarihi</Label>
        <Input
          id="hire_date"
          type="date"
          value={formData.hire_date}
          onChange={(e) => handleInputChange('hire_date', e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Durum</Label>
        <Select
          value={formData.status}
          onValueChange={(value: 'active' | 'inactive') => 
            handleInputChange('status', value)
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
      </div>
    </>
  );
};
