import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CustomerFormData } from "@/types/customer";
import { Building, FileText, CheckCircle, XCircle, Loader2, UserPlus } from "lucide-react";
import CustomerTypeAndStatus from "./CustomerTypeAndStatus";
import { useEinvoiceMukellefCheck } from "@/hooks/useEinvoiceMukellefCheck";
import { useNilveraCompanyInfo } from "@/hooks/useNilveraCompanyInfo";
import { useVknToCustomer } from "@/hooks/useVknToCustomer";
import { useEffect } from "react";

interface CompanyBasicInfoProps {
  formData: CustomerFormData;
  setFormData: (value: CustomerFormData) => void;
}

const CompanyBasicInfo = ({ formData, setFormData }: CompanyBasicInfoProps) => {
  const { checkEinvoiceMukellef, isChecking, result, clearResult } = useEinvoiceMukellefCheck();
  const { searchMukellef, isLoading: isNilveraLoading, mukellefInfo, error: nilveraError } = useNilveraCompanyInfo();
  const { createCustomerFromVkn, isCreating } = useVknToCustomer();

  // Vergi numarası değiştiğinde otomatik kontrol yap
  useEffect(() => {
    if (formData.tax_number && formData.tax_number.length >= 10) {
      const timeoutId = setTimeout(() => {
        // Hem eski hem yeni hook'u kullan
        checkEinvoiceMukellef(formData.tax_number);
        searchMukellef(formData.tax_number);
      }, 1000); // 1 saniye bekle

      return () => clearTimeout(timeoutId);
    } else {
      clearResult();
    }
  }, [formData.tax_number, checkEinvoiceMukellef, searchMukellef, clearResult]);

  // E-fatura mükellefi bilgilerini form data'ya ekle
  useEffect(() => {
    if (result && result.isEinvoiceMukellef && result.data) {
      setFormData({
        ...formData,
        // E-fatura mükellefi bilgilerini form data'ya ekle
        company: formData.company || result.data?.companyName || formData.company,
        tax_office: formData.tax_office || result.data?.taxOffice || formData.tax_office,
        address: formData.address || result.data?.address || formData.address,
      });
    }
  }, [result]);

  // Nilvera'dan gelen mükellef bilgilerini form data'ya ekle
  useEffect(() => {
    if (mukellefInfo) {
      setFormData({
        ...formData,
        // Nilvera mükellef bilgilerini form data'ya ekle
        company: formData.company || mukellefInfo.companyName || formData.company,
        tax_office: formData.tax_office || mukellefInfo.taxOffice || formData.tax_office,
        address: formData.address || mukellefInfo.address || formData.address,
      });
    }
  }, [mukellefInfo]);

  // VKN bilgilerini müşteri olarak kaydet
  const handleSaveAsCustomer = async () => {
    const vknData = {
      taxNumber: formData.tax_number,
      companyName: mukellefInfo?.companyName || result?.data?.companyName || formData.company || '',
      aliasName: mukellefInfo?.aliasName || result?.data?.aliasName,
      taxOffice: mukellefInfo?.taxOffice || result?.data?.taxOffice || formData.tax_office,
      address: mukellefInfo?.address || result?.data?.address || formData.address,
      city: mukellefInfo?.city || result?.data?.city,
      district: mukellefInfo?.district || result?.data?.district,
      mersisNo: mukellefInfo?.mersisNo || result?.data?.mersisNo,
      sicilNo: mukellefInfo?.sicilNo || result?.data?.sicilNo,
      email: formData.email,
      phone: formData.mobile_phone || formData.office_phone,
    };

    await createCustomerFromVkn(vknData);
  };

  return (
    <div className="space-y-4">
      {/* Vergi Kimlik Bilgileri */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <div className="w-0.5 h-3 bg-amber-500 rounded-full"></div>
          Vergi Kimlik Bilgileri
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="tax_number" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3 text-amber-500" />
              <span>Vergi No / TC Kimlik *</span>
            </Label>
            <div className="relative">
              <Input
                id="tax_number"
                value={formData.tax_number}
                onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                placeholder="1234567890 veya 12345678901"
                className="pr-32"
              />
              {/* E-fatura mükellefi durumu göstergesi */}
              {formData.tax_number && formData.tax_number.length >= 10 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {(isChecking || isNilveraLoading) ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  ) : (result || mukellefInfo) ? (
                    (result?.isEinvoiceMukellef || mukellefInfo) ? (
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

        {/* E-fatura mükellefi detay bilgileri ve otomatik doldurma önerisi */}
        {(result && result.isEinvoiceMukellef && result.data) || mukellefInfo ? (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">E-Fatura Mükellefi Bulundu</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveAsCustomer}
                disabled={isCreating}
                className="h-7 px-2 text-xs bg-white hover:bg-green-50 border-green-300 text-green-700 hover:text-green-800"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3 mr-1" />
                    Müşteri Olarak Kaydet
                  </>
                )}
              </Button>
            </div>
            <div className="space-y-1 text-xs text-green-700 mb-3">
              {/* Eski hook'tan gelen veriler */}
              {result && result.data && (
                <>
                  <div><strong>Şirket:</strong> {result.data.companyName}</div>
                  {result.data.aliasName && <div><strong>E-Fatura Alias:</strong> {result.data.aliasName}</div>}
                  {result.data.taxOffice && <div><strong>Vergi Dairesi:</strong> {result.data.taxOffice}</div>}
                  {result.data.address && <div><strong>Adres:</strong> {result.data.address}</div>}
                  {result.data.city && <div><strong>Şehir:</strong> {result.data.city}</div>}
                </>
              )}
              {/* Yeni Nilvera hook'undan gelen veriler */}
              {mukellefInfo && (
                <>
                  <div><strong>Şirket:</strong> {mukellefInfo.companyName}</div>
                  {mukellefInfo.aliasName && <div><strong>E-Fatura Alias:</strong> {mukellefInfo.aliasName}</div>}
                  {mukellefInfo.taxOffice && <div><strong>Vergi Dairesi:</strong> {mukellefInfo.taxOffice}</div>}
                  {mukellefInfo.address && <div><strong>Adres:</strong> {mukellefInfo.address}</div>}
                  {mukellefInfo.city && <div><strong>Şehir:</strong> {mukellefInfo.city}</div>}
                  {mukellefInfo.district && <div><strong>İlçe:</strong> {mukellefInfo.district}</div>}
                  {mukellefInfo.mersisNo && <div><strong>Mersis No:</strong> {mukellefInfo.mersisNo}</div>}
                  {mukellefInfo.sicilNo && <div><strong>Sicil No:</strong> {mukellefInfo.sicilNo}</div>}
                </>
              )}
            </div>
            
            {/* Otomatik doldurma önerisi */}
            <div className="p-2 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-800 font-medium">Bu bilgileri diğer alanlara otomatik doldurmak ister misiniz?</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const vknData = mukellefInfo || result?.data;
                    if (vknData) {
                      setFormData({
                        ...formData,
                        company: vknData.companyName || formData.company,
                        tax_office: vknData.taxOffice || formData.tax_office,
                        address: vknData.address || formData.address,
                        city: vknData.city || formData.city,
                        district: vknData.district || formData.district,
                        einvoice_alias_name: vknData.aliasName || formData.einvoice_alias_name,
                      });
                    }
                  }}
                  className="h-6 px-2 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-100"
                >
                  Evet, Doldur
                </Button>
              </div>
            </div>
          </div>
        ) : null}
        
        {/* Hata durumu */}
        {nilveraError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Nilvera API Hatası</span>
            </div>
            <div className="text-xs text-red-700">
              {nilveraError}
            </div>
          </div>
        )}
      </div>

      {/* Şirket ve Adres Bilgileri */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <div className="w-0.5 h-3 bg-purple-500 rounded-full"></div>
          Şirket ve Adres Bilgileri
        </h3>
        
        <div className="space-y-3">
          {/* Şirket Adı */}
          <div className="space-y-1">
            <Label htmlFor="company" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Building className="w-3 h-3 text-purple-500" />
              <span>Şirket Adı</span>
            </Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Şirket adı giriniz"
              className="text-sm h-9"
            />
          </div>

          {/* Adres Bilgileri - Kompakt Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="city" className="text-xs font-medium text-muted-foreground">
                İl
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="İl seçiniz"
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="district" className="text-xs font-medium text-muted-foreground">
                İlçe
              </Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="İlçe seçiniz"
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="address" className="text-xs font-medium text-muted-foreground">
                Detaylı Adres
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Mahalle, sokak, bina no..."
                className="text-sm h-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Müşteri Tipi ve Durumu */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <div className="w-0.5 h-3 bg-green-500 rounded-full"></div>
          Müşteri Tipi ve Durumu
        </h3>
        <CustomerTypeAndStatus formData={formData} setFormData={setFormData} />
      </div>
    </div>
  );
};

export default CompanyBasicInfo;
