
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { CustomerFormData } from "@/types/customer";
import { User, Mail, Phone, Building, FileText, MapPin, Users, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { getDigitsOnly, formatPhoneNumber } from "@/utils/phoneFormatter";
import { useEinvoiceMukellefCheck } from "@/hooks/useEinvoiceMukellefCheck";
import { useEffect } from "react";

interface BasicInformationProps {
  formData: CustomerFormData;
  setFormData: (value: CustomerFormData) => void;
}

const BasicInformation = ({ formData, setFormData }: BasicInformationProps) => {
  const { checkEinvoiceMukellef, isChecking, result, clearResult } = useEinvoiceMukellefCheck();

  // Vergi numarası değiştiğinde otomatik kontrol yap
  useEffect(() => {
    if (formData.tax_number && formData.tax_number.length >= 10) {
      const timeoutId = setTimeout(() => {
        checkEinvoiceMukellef(formData.tax_number);
      }, 1000); // 1 saniye bekle

      return () => clearTimeout(timeoutId);
    } else {
      clearResult();
    }
  }, [formData.tax_number, checkEinvoiceMukellef, clearResult]);

  // E-fatura mükellefi bilgilerini form data'ya ekle
  useEffect(() => {
    if (result && result.isEinvoiceMukellef && result.data) {
      setFormData(prev => ({
        ...prev,
        // E-fatura mükellefi bilgilerini form data'ya ekle
        company: prev.company || result.data?.companyName || prev.company,
        tax_office: prev.tax_office || result.data?.taxOffice || prev.tax_office,
        address: prev.address || result.data?.address || prev.address,
      }));
    }
  }, [result, setFormData]);

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
          
          {/* Second Row: Phone Numbers & Representative */}
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
        </div>
      </div>

      {/* Vergi & Adres Bilgileri */}
      <div className="p-4 bg-card rounded-lg border border-border/50">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <div className="w-0.5 h-3 bg-amber-500 rounded-full"></div>
          Vergi & Adres Bilgileri
        </h3>
        
        {/* Tax Information */}
        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <FileText className="w-3 h-3 text-amber-500" />
            Vergi Bilgileri
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="tax_number" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <FileText className="w-3 h-3 text-amber-500" />
                <span>Vergi No / TC Kimlik</span>
              </Label>
              <div className="relative">
                <Input
                  id="tax_number"
                  value={formData.tax_number}
                  onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                  placeholder="1234567890 veya 12345678901"
                />
                {/* E-fatura mükellefi durumu göstergesi */}
                {formData.tax_number && formData.tax_number.length >= 10 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isChecking ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    ) : result ? (
                      result.isEinvoiceMukellef ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">E-Fatura Mükellefi</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <XCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">E-Fatura Mükellefi Değil</span>
                        </div>
                      )
                    ) : null}
                  </div>
                )}
              </div>
              {/* E-fatura mükellefi detay bilgileri */}
              {result && result.isEinvoiceMukellef && result.data && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">E-Fatura Mükellefi Bulundu</span>
                  </div>
                  <div className="space-y-1 text-xs text-green-700">
                    <div><strong>Şirket:</strong> {result.data.companyName}</div>
                    {result.data.aliasName && <div><strong>E-Fatura Alias:</strong> {result.data.aliasName}</div>}
                    {result.data.taxOffice && <div><strong>Vergi Dairesi:</strong> {result.data.taxOffice}</div>}
                    {result.data.address && <div><strong>Adres:</strong> {result.data.address}</div>}
                    {result.data.city && <div><strong>Şehir:</strong> {result.data.city}</div>}
                  </div>
                </div>
              )}
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
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Mahalle, sokak, bina no, daire no vb."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInformation;
