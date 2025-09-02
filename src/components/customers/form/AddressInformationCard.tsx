import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomerFormData } from "@/types/customer";
import { MapPin, Building2 } from "lucide-react";

interface AddressInformationCardProps {
  formData: CustomerFormData;
  setFormData: (data: CustomerFormData) => void;
}

const AddressInformationCard = ({ formData, setFormData }: AddressInformationCardProps) => {
  return (
    <Card className="shadow-sm border-l-4 border-l-rose-500">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <MapPin className="w-5 h-5 text-rose-500" />
          Adres Bilgileri
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium flex items-center gap-1">
              <Building2 className="w-3 h-3 text-rose-500" />
              Şehir
            </Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="İstanbul"
              className="transition-all duration-200 focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="district" className="text-sm font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-500" />
              İlçe
            </Label>
            <Input
              id="district"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              placeholder="Beşiktaş"
              className="transition-all duration-200 focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-500" />
            Tam Adres
          </Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Detaylı adres bilgisi giriniz..."
            rows={4}
            className="resize-none transition-all duration-200 focus:ring-2 focus:ring-rose-500/20"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressInformationCard;