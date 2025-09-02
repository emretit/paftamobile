import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerFormData } from "@/types/customer";
import { Phone, Mail, Smartphone, UserCircle } from "lucide-react";
import RepresentativeSelect from "./RepresentativeSelect";

interface ContactInformationCardProps {
  formData: CustomerFormData;
  setFormData: (data: CustomerFormData) => void;
}

const ContactInformationCard = ({ formData, setFormData }: ContactInformationCardProps) => {
  return (
    <Card className="shadow-sm border-l-4 border-l-blue-500">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <Phone className="w-5 h-5 text-blue-500" />
          İletişim Bilgileri
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
            <Mail className="w-3 h-3 text-blue-500" />
            E-posta
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="ornek@email.com"
            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mobile_phone" className="text-sm font-medium flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-blue-500" />
              Cep Telefonu
            </Label>
            <Input
              id="mobile_phone"
              value={formData.mobile_phone}
              onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
              placeholder="0555 123 45 67"
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="office_phone" className="text-sm font-medium flex items-center gap-1">
              <Phone className="w-3 h-3 text-blue-500" />
              Sabit Telefon
            </Label>
            <Input
              id="office_phone"
              value={formData.office_phone}
              onChange={(e) => setFormData({ ...formData, office_phone: e.target.value })}
              placeholder="0212 123 45 67"
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1">
            <UserCircle className="w-3 h-3 text-blue-500" />
            Temsilci
          </Label>
          <RepresentativeSelect formData={formData} setFormData={setFormData} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactInformationCard;