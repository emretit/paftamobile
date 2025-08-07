
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { supabase } from "@/integrations/supabase/client";

export const CompanyInfoTab = () => {
  const { settings, updateSettings } = useCompanySettings();

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data, error } = await supabase.storage
      .from('logos')
      .upload(`${settings?.id}/${file.name}`, file);

    if (error) {
      console.error('Error uploading logo:', error);
      return;
    }

    if (data) {
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(data.path);

      updateSettings({ logo_url: publicUrl });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Şirket Bilgileri</CardTitle>
        <CardDescription>
          Şirketinizin temel bilgilerini güncelleyin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-6">
          {/* Temel Bilgiler */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Şirket Adı</Label>
              <Input
                id="company_name"
                placeholder="örn: NGS Teknoloji Ltd. Şti."
                value={settings?.company_name || ''}
                onChange={(e) => updateSettings({ company_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Textarea
                id="address"
                placeholder="Şirket adresinizi giriniz"
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
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label>Şirket Logosu</Label>
            <div className="flex items-center gap-4">
              {settings?.logo_url && (
                <img 
                  src={settings.logo_url} 
                  alt="Company logo" 
                  className="h-16 w-16 object-contain border rounded p-2"
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
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
