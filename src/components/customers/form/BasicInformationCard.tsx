import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerFormData } from "@/types/customer";
import { User, Building, UserCheck } from "lucide-react";

interface BasicInformationCardProps {
  formData: CustomerFormData;
  setFormData: (data: CustomerFormData) => void;
}

const BasicInformationCard = ({ formData, setFormData }: BasicInformationCardProps) => {
  return (
    <Card className="shadow-sm border-l-4 border-l-primary">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <User className="w-5 h-5 text-primary" />
          Temel Bilgiler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1">
            <User className="w-3 h-3 text-primary" />
            Ad Soyad / Firma Adı *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Müşteri adı"
            required
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company" className="text-sm font-medium flex items-center gap-1">
            <Building className="w-3 h-3 text-muted-foreground" />
            Şirket/Kurum
          </Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Şirket veya kurum adı"
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-blue-500" />
              Müşteri Tipi
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: "bireysel" | "kurumsal") => 
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bireysel">Bireysel</SelectItem>
                <SelectItem value="kurumsal">Kurumsal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              Durum
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: "aktif" | "pasif" | "potansiyel") => 
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="pasif">Pasif</SelectItem>
                <SelectItem value="potansiyel">Potansiyel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInformationCard;