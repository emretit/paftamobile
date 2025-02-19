
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";

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
          Şirket bilgilerini güncelleyin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Şirket Adı</Label>
            <Input
              id="company_name"
              value={settings?.company_name || ''}
              onChange={(e) => updateSettings({ company_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Şirket Logosu</Label>
            <div className="flex items-center gap-4">
              {settings?.logo_url && (
                <img 
                  src={settings.logo_url} 
                  alt="Company logo" 
                  className="h-16 w-16 object-contain"
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
                  Logo Yükle
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <Input
              id="address"
              value={settings?.address || ''}
              onChange={(e) => updateSettings({ address: e.target.value })}
            />
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={settings?.phone || ''}
                onChange={(e) => updateSettings({ phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={settings?.email || ''}
                onChange={(e) => updateSettings({ email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax_number">Vergi Numarası</Label>
            <Input
              id="tax_number"
              value={settings?.tax_number || ''}
              onChange={(e) => updateSettings({ tax_number: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
