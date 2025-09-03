import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerFormData } from "@/types/customer";
import { User, Mail, Phone, Building, MapPin, FileText, Banknote } from "lucide-react";

interface CustomerFormContentNewProps {
  formData: CustomerFormData;
  setFormData: (data: CustomerFormData) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isPending: boolean;
  isEdit: boolean;
  onCancel: () => void;
}

const CustomerFormContentNew = ({
  formData,
  setFormData,
  handleSubmit,
  isPending,
  isEdit,
  onCancel
}: CustomerFormContentNewProps) => {
  return (
    <div className="max-w-7xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temel Bilgiler */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-full"></div>
                <User className="w-4 h-4 text-primary" />
                Temel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Adı Soyadı *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Müşteri adı soyadı"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Müşteri Tipi *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "bireysel" | "kurumsal") =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tip seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bireysel">👤 Bireysel</SelectItem>
                      <SelectItem value="kurumsal">🏢 Kurumsal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Durum *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "aktif" | "pasif" | "potansiyel") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Durum seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aktif">✅ Aktif</SelectItem>
                      <SelectItem value="pasif">⏸️ Pasif</SelectItem>
                      <SelectItem value="potansiyel">🎯 Potansiyel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {formData.type === 'kurumsal' && (
                <div className="space-y-2">
                  <Label htmlFor="company">Şirket Adı</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Şirket adı"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* İletişim Bilgileri */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                <Mail className="w-4 h-4 text-blue-500" />
                İletişim Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ornek@email.com"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile_phone">Cep Telefonu</Label>
                  <Input
                    id="mobile_phone"
                    value={formData.mobile_phone}
                    onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
                    placeholder="0555 123 45 67"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="office_phone">İş Telefonu</Label>
                  <Input
                    id="office_phone"
                    value={formData.office_phone}
                    onChange={(e) => setFormData({ ...formData, office_phone: e.target.value })}
                    placeholder="0212 123 45 67"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="representative">Temsilci</Label>
                <Input
                  id="representative"
                  value={formData.representative}
                  onChange={(e) => setFormData({ ...formData, representative: e.target.value })}
                  placeholder="Yetkili kişi adı"
                />
              </div>
            </CardContent>
          </Card>

          {/* Adres Bilgileri */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                <MapPin className="w-4 h-4 text-green-500" />
                Adres Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Tam adres"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Şehir</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Şehir"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">İlçe</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="İlçe"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mali Bilgiler ve Vergi */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
                <Banknote className="w-4 h-4 text-amber-500" />
                Mali Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="balance">Bakiye</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              {formData.type === 'kurumsal' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tax_number">Vergi Numarası *</Label>
                    <Input
                      id="tax_number"
                      required
                      value={formData.tax_number}
                      onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_office">Vergi Dairesi</Label>
                    <Input
                      id="tax_office"
                      value={formData.tax_office}
                      onChange={(e) => setFormData({ ...formData, tax_office: e.target.value })}
                      placeholder="Vergi dairesi adı"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="einvoice_alias_name">E-Fatura Alias</Label>
                    <Input
                      id="einvoice_alias_name"
                      value={formData.einvoice_alias_name}
                      onChange={(e) => setFormData({ ...formData, einvoice_alias_name: e.target.value })}
                      placeholder="E-Fatura alias adı"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="px-8"
          >
            İptal
          </Button>
          <Button 
            type="submit" 
            disabled={isPending}
            className="px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isPending ? "Kaydediliyor..." : (isEdit ? "Güncelle" : "Kaydet")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerFormContentNew;