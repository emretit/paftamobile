
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerFormData } from "@/types/customer";
import { FileText, Building } from "lucide-react";

interface CompanyInformationProps {
  formData: CustomerFormData;
  setFormData: (value: CustomerFormData) => void;
}

const CompanyInformation = ({ formData, setFormData }: CompanyInformationProps) => {
  if (formData.type !== 'kurumsal') return null;

  return (
    <div className="p-3 bg-card rounded-lg border border-border/50">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
        <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
        Vergi Bilgileri
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="tax_number" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <FileText className="w-3 h-3 text-amber-500" />
            <span>Vergi Numarası *</span>
          </Label>
          <Input
            id="tax_number"
            required
            value={formData.tax_number}
            onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
            placeholder="1234567890"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax_office" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <Building className="w-3 h-3 text-amber-600" />
            <span>Vergi Dairesi</span>
          </Label>
          <Input
            id="tax_office"
            value={formData.tax_office}
            onChange={(e) => setFormData({ ...formData, tax_office: e.target.value })}
            placeholder="Vergi dairesi adı"
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyInformation;
