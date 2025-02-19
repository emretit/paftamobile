
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

type CompanySettings = {
  id: string;
  company_name: string;
  address: string;
  phone: string;
  email: string;
  tax_number: string;
  logo_url: string;
  default_currency: string;
  email_settings: {
    notifications_enabled: boolean;
  };
};

type AuditLog = {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: any;
  created_at: string;
};

export const SystemSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data as CompanySettings;
    }
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AuditLog[];
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<CompanySettings>) => {
      const { error } = await supabase
        .from('company_settings')
        .update(newSettings)
        .eq('id', settings?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      toast({
        title: "Ayarlar güncellendi",
        description: "Sistem ayarları başarıyla kaydedildi.",
      });
    },
  });

  const handleSettingsChange = (key: keyof CompanySettings, value: any) => {
    if (settings) {
      updateSettings.mutate({ [key]: value });
    }
  };

  if (settingsLoading || logsLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="general">Genel Ayarlar</TabsTrigger>
        <TabsTrigger value="company">Şirket Bilgileri</TabsTrigger>
        <TabsTrigger value="audit">Denetim Günlüğü</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
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
                  handleSettingsChange('email_settings', { notifications_enabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="company">
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
                  onChange={(e) => handleSettingsChange('company_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <Input
                  id="address"
                  value={settings?.address || ''}
                  onChange={(e) => handleSettingsChange('address', e.target.value)}
                />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={settings?.phone || ''}
                    onChange={(e) => handleSettingsChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings?.email || ''}
                    onChange={(e) => handleSettingsChange('email', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_number">Vergi Numarası</Label>
                <Input
                  id="tax_number"
                  value={settings?.tax_number || ''}
                  onChange={(e) => handleSettingsChange('tax_number', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="audit">
        <Card>
          <CardHeader>
            <CardTitle>Denetim Günlüğü</CardTitle>
            <CardDescription>
              Sistem üzerinde yapılan değişikliklerin kaydı
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlem</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Kullanıcı</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.created_at).toLocaleString('tr-TR')}
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.entity_type}</TableCell>
                    <TableCell>{log.user_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
