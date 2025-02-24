
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerFormData } from "@/types/customer";

interface BasicInformationProps {
  formData: CustomerFormData;
  setFormData: (value: CustomerFormData) => void;
}

const BasicInformation = ({ formData, setFormData }: BasicInformationProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Müşteri Adı</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mobile_phone">Cep Telefonu</Label>
          <Input
            id="mobile_phone"
            value={formData.mobile_phone}
            onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="office_phone">Sabit Telefon</Label>
          <Input
            id="office_phone"
            value={formData.office_phone}
            onChange={(e) => setFormData({ ...formData, office_phone: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Şirket</Label>
        <Input
          id="company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
      </div>
    </>
  );
};

export default BasicInformation;
