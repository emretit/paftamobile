
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export const SystemSettings = () => {
  return (
    <div className="space-y-6">
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
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>İki Faktörlü Doğrulama</Label>
              <div className="text-sm text-muted-foreground">
                Kullanıcılar için 2FA zorunluluğu
              </div>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Oturum Süresi (saat)</Label>
              <div className="text-sm text-muted-foreground">
                Kullanıcı oturumlarının maksimum süresi
              </div>
            </div>
            <input
              type="number"
              className="w-20 px-2 py-1 border rounded"
              defaultValue={24}
              min={1}
              max={72}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yedekleme & Bakım</CardTitle>
          <CardDescription>
            Sistem yedekleme ve bakım işlemlerini yönetin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Otomatik Yedekleme</Label>
              <div className="text-sm text-muted-foreground">
                Günlük sistem yedeklemesi
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Bakım Modu</Label>
              <div className="text-sm text-muted-foreground">
                Sistem bakım modunu aktifleştir
              </div>
            </div>
            <Switch />
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline">Manuel Yedek Al</Button>
            <Button variant="destructive">Önbelleği Temizle</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
