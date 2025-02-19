
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCompanySettings } from "@/hooks/useCompanySettings";

export const GeneralSettingsTab = () => {
  const { settings, updateSettings } = useCompanySettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Genel Ayarlar</CardTitle>
        <CardDescription>
          Sistemin genel ayarlarını buradan yönetebilirsiniz.
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
  );
};
