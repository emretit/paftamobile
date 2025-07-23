
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerFormData } from "@/types/customer";
import { User, Mail, Phone, Building, FileText } from "lucide-react";

interface BasicInformationProps {
  formData: CustomerFormData;
  setFormData: (value: CustomerFormData) => void;
}

const BasicInformation = ({ formData, setFormData }: BasicInformationProps) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="company" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <Building className="w-3 h-3 text-purple-500" />
            <span>Şirket Adı</span>
          </Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Şirket adı giriniz"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <User className="w-3 h-3 text-primary" />
            <span>Yetkili Kişi *</span>
          </Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Yetkili kişi adı giriniz"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <Mail className="w-3 h-3 text-blue-500" />
            <span>E-posta</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="ornek@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile_phone" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <Phone className="w-3 h-3 text-green-500" />
            <span>Cep Telefonu</span>
          </Label>
          <Input
            id="mobile_phone"
            value={formData.mobile_phone}
            onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
            placeholder="+90 5XX XXX XX XX"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="office_phone" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          <Phone className="w-3 h-3 text-orange-500" />
          <span>İş Telefonu</span>
        </Label>
        <Input
          id="office_phone"
          value={formData.office_phone}
          onChange={(e) => setFormData({ ...formData, office_phone: e.target.value })}
          placeholder="+90 2XX XXX XX XX"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="tax_number" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <FileText className="w-3 h-3 text-amber-500" />
            <span>Vergi No / TC Kimlik</span>
          </Label>
          <Input
            id="tax_number"
            value={formData.tax_number}
            onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
            placeholder="1234567890 veya 12345678901"
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

export default BasicInformation;
