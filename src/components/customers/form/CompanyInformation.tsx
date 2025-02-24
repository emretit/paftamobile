
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerFormData } from "@/types/customer";

interface CompanyInformationProps {
  formData: CustomerFormData;
  setFormData: (value: CustomerFormData) => void;
}

const CompanyInformation = ({ formData, setFormData }: CompanyInformationProps) => {
  if (formData.type !== 'kurumsal') return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="tax_number">Vergi Numarası</Label>
        <Input
          id="tax_number"
          required
          value={formData.tax_number}
          onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tax_office">Vergi Dairesi</Label>
        <Input
          id="tax_office"
          value={formData.tax_office}
          onChange={(e) => setFormData({ ...formData, tax_office: e.target.value })}
        />
      </div>
    </div>
  );
};

export default CompanyInformation;
