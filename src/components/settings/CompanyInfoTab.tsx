
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCompanySettings } from "@/hooks/useCompanySettings";

export const CompanyInfoTab = () => {
  const { settings, updateSettings } = useCompanySettings();

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
