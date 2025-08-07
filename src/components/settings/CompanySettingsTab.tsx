import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Save, Building, Settings } from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const CompanySettingsTab = () => {
  const { settings, updateSettings } = useCompanySettings();
  const [isSaving, setIsSaving] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data, error } = await supabase.storage
      .from('logos')
      .upload(`${settings?.id}/${file.name}`, file);

    if (error) {
      console.error('Error uploading logo:', error);
      toast.error('Logo yüklenirken hata oluştu');
      return;
    }

    if (data) {
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(data.path);

      updateSettings({ logo_url: publicUrl });
      toast.success('Logo başarıyla yüklendi');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // updateSettings fonksiyonu zaten kaydetme işlemini yapıyor
      // Burada ekstra bir şey yapmaya gerek yok, sadece kullanıcıya feedback verelim
      toast.success('Ayarlar başarıyla kaydedildi');
    } catch (error) {
      toast.error('Ayarlar kaydedilirken hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Şirket Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Şirket Bilgileri
          </CardTitle>
          <CardDescription>
            Şirketinizin temel bilgilerini ve iletişim detaylarını yönetin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Şirket Adı *</Label>
              <Input
                id="company_name"
                placeholder="örn: NGS Teknoloji Ltd. Şti."
                value={settings?.company_name || ''}
                onChange={(e) => updateSettings({ company_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Şirket Adresi</Label>
              <Textarea
                id="address"
                placeholder="Tam şirket adresinizi giriniz"
                rows={3}
                value={settings?.address || ''}
                onChange={(e) => updateSettings({ address: e.target.value })}
              />
            </div>

            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  placeholder="+90 212 555 0123"
                  value={settings?.phone || ''}
                  onChange={(e) => updateSettings({ phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="info@sirket.com"
                  value={settings?.email || ''}
                  onChange={(e) => updateSettings({ email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tax_number">Vergi Numarası</Label>
                <Input
                  id="tax_number"
                  placeholder="1234567890"
                  value={settings?.tax_number || ''}
                  onChange={(e) => updateSettings({ tax_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_office">Vergi Dairesi</Label>
                <Input
                  id="tax_office"
                  placeholder="Beşiktaş Vergi Dairesi"
                  value={settings?.tax_office || ''}
                  onChange={(e) => updateSettings({ tax_office: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Web Sitesi</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://www.sirket.com"
                value={settings?.website || ''}
                onChange={(e) => updateSettings({ website: e.target.value })}
              />
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Label>Şirket Logosu</Label>
              <div className="flex items-center gap-4">
                {settings?.logo_url && (
                  <img 
                    src={settings.logo_url} 
                    alt="Company logo" 
                    className="h-16 w-16 object-contain border rounded p-2 bg-white"
                  />
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="logo-upload"
                    onChange={handleLogoUpload}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {settings?.logo_url ? 'Logo Değiştir' : 'Logo Yükle'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG veya SVG • Maksimum 2MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sistem Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sistem Ayarları
          </CardTitle>
          <CardDescription>
            Genel sistem tercihleri ve bildirim ayarları
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Varsayılan Para Birimi</Label>
              <Select
                value={settings?.default_currency || 'TRY'}
                onValueChange={(value) => updateSettings({ default_currency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Para birimi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRY">Türk Lirası (₺)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>E-posta Bildirimleri</Label>
                <div className="text-sm text-muted-foreground">
                  Sistem bildirimleri için e-posta gönderimi
                </div>
              </div>
              <Switch
                checked={settings?.email_settings?.notifications_enabled || false}
                onCheckedChange={(checked) =>
                  updateSettings({ 
                    email_settings: { 
                      ...settings?.email_settings,
                      notifications_enabled: checked 
                    } 
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kaydet Butonu */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </Button>
      </div>
    </div>
  );
};