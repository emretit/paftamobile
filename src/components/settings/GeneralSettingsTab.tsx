
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompanySettings } from "@/hooks/useCompanySettings";

export const GeneralSettingsTab = () => {
  const { settings, updateSettings } = useCompanySettings();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sistem Tercihleri</CardTitle>
          <CardDescription>
            Temel sistem ayarlarını buradan yönetebilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Varsayılan Para Birimi</Label>
              <Select
                value={settings?.default_currency}
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bildirim Ayarları</CardTitle>
          <CardDescription>
            Sistem bildirim tercihlerini yönetin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>E-posta Bildirimleri</Label>
              <div className="text-sm text-muted-foreground">
                Sistem bildirimleri için e-posta gönderimi
              </div>
            </div>
            <Switch
              checked={settings?.email_settings.notifications_enabled}
              onCheckedChange={(checked) =>
                updateSettings({ email_settings: { notifications_enabled: checked } })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
