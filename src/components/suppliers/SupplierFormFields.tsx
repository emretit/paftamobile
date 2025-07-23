
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { SupplierFormData } from "@/types/supplier";
import { User, Mail, Phone, Building, FileText, MapPin, Users } from "lucide-react";
import { getDigitsOnly, formatPhoneNumber } from "@/utils/phoneFormatter";

interface SupplierFormFieldsProps {
  formData: SupplierFormData;
  setFormData: React.Dispatch<React.SetStateAction<SupplierFormData>>;
}

const SupplierFormFields = ({ formData, setFormData }: SupplierFormFieldsProps) => {
  return (
    <div className="space-y-6">
      {/* İletişim Bilgileri */}
      <div className="p-4 bg-card rounded-lg border border-border/50">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <div className="w-0.5 h-3 bg-primary rounded-full"></div>
          İletişim Bilgileri
        </h3>
        
        <div className="space-y-3">
          {/* First Row: Company, Contact Person, Email */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Building className="w-3 h-3 text-purple-500" />
                <span>Firma Adı</span>
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Firma adı giriniz"
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
                placeholder="email@example.com"
              />
            </div>
          </div>
          
          {/* Second Row: Phone Numbers, Representative, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="mobile_phone" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3 text-green-500" />
                <span>Cep Telefonu</span>
              </Label>
              <PhoneInput
                id="mobile_phone"
                value={formData.mobile_phone ? formatPhoneNumber(formData.mobile_phone) : ""}
                onChange={(value) => setFormData({ ...formData, mobile_phone: getDigitsOnly(value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="office_phone" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3 text-orange-500" />
                <span>İş Telefonu</span>
              </Label>
              <PhoneInput
                id="office_phone"
                value={formData.office_phone ? formatPhoneNumber(formData.office_phone) : ""}
                onChange={(value) => setFormData({ ...formData, office_phone: getDigitsOnly(value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="representative" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3 text-indigo-500" />
                <span>Temsilci</span>
              </Label>
              <Input
                id="representative"
                value={formData.representative}
                onChange={(e) => setFormData({ ...formData, representative: e.target.value })}
                placeholder="Temsilci adı (opsiyonel)"
              />
            </div>
          </div>

          {/* Third Row: Type, Status, Balance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Building className="w-3 h-3 text-amber-500" />
                <span>Türü</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: "bireysel" | "kurumsal") =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bireysel">Bireysel</SelectItem>
                  <SelectItem value="kurumsal">Kurumsal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <FileText className="w-3 h-3 text-emerald-500" />
                <span>Durum</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: "aktif" | "pasif" | "potansiyel") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="pasif">Pasif</SelectItem>
                  <SelectItem value="potansiyel">Potansiyel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <FileText className="w-3 h-3 text-rose-500" />
                <span>Bakiye</span>
              </Label>
              <Input
                id="balance"
                type="number"
                value={formData.balance}
                onChange={(e) =>
                  setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })
                }
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vergi & Adres Bilgileri */}
      <div className="p-4 bg-card rounded-lg border border-border/50">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <div className="w-0.5 h-3 bg-amber-500 rounded-full"></div>
          Vergi & Adres Bilgileri
        </h3>
        
        {/* Tax Information */}
        {formData.type === "kurumsal" && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg">
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <FileText className="w-3 h-3 text-amber-500" />
              Vergi Bilgileri
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tax_number" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3 h-3 text-amber-500" />
                  <span>Vergi Numarası</span>
                </Label>
                <Input
                  id="tax_number"
                  value={formData.tax_number}
                  onChange={(e) =>
                    setFormData({ ...formData, tax_number: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, tax_office: e.target.value })
                  }
                  placeholder="Vergi dairesi adı"
                />
              </div>
            </div>
          </div>
        )}

        {/* Address Information */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-500" />
            Adres Bilgileri
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>Ülke</span>
                </Label>
                <Input
                  id="country"
                  value="Türkiye"
                  placeholder="Ülke seçiniz"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-600" />
                  <span>İl</span>
                </Label>
                <Input
                  id="city"
                  placeholder="İl seçiniz"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-700" />
                  <span>İlçe</span>
                </Label>
                <Input
                  id="district"
                  placeholder="İlçe seçiniz"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>Detaylı Adres</span>
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Mahalle, sokak, bina no, daire no vb."
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierFormFields;
