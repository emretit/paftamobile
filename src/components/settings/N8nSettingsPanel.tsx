import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { useN8nTrigger } from '../../hooks/useN8nTrigger';
import WorkflowMonitor from '../n8n/WorkflowMonitor';
import { 
  Settings, 
  Zap, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Globe, 
  Key,
  Workflow,
  Clock,
  Database,
  TestTube
} from 'lucide-react';

interface N8nSettings {
  enabled: boolean;
  webhookUrls: {
    fetchInvoices: string;
    syncStatus: string;
    downloadPdf: string;
    notification: string;
  };
  autoSync: {
    enabled: boolean;
    schedule: string;
    timezone: string;
  };
  notifications: {
    slack: boolean;
    email: boolean;
    teams: boolean;
  };
  retrySettings: {
    maxRetries: number;
    retryDelay: number;
  };
}

const N8nSettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<N8nSettings>({
    enabled: false,
    webhookUrls: {
      fetchInvoices: '',
      syncStatus: '',
      downloadPdf: '',
      notification: ''
    },
    autoSync: {
      enabled: false,
      schedule: '0 9 * * *', // Her gün saat 9:00
      timezone: 'Europe/Istanbul'
    },
    notifications: {
      slack: false,
      email: false,
      teams: false
    },
    retrySettings: {
      maxRetries: 3,
      retryDelay: 5000
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  
  const { triggerWorkflow } = useN8nTrigger();

  // Load settings from localStorage or API
  const loadSettings = async () => {
    try {
      const savedSettings = localStorage.getItem('n8n-settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading n8n settings:', error);
    }
  };

  // Save settings
  const saveSettings = async () => {
    try {
      setLoading(true);
      
      // Save to localStorage
      localStorage.setItem('n8n-settings', JSON.stringify(settings));
      
      // Here you could also save to Supabase user preferences
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            preference_key: 'n8n_settings',
            preference_value: settings
          });
        
        if (error) {
          console.error('Error saving to database:', error);
        }
      }
      
      toast.success('n8n ayarları kaydedildi');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Ayarlar kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  // Test n8n connection
  const testConnection = async () => {
    try {
      setTesting(true);
      setConnectionStatus('unknown');
      
      if (!settings.webhookUrls.fetchInvoices) {
        throw new Error('Webhook URL girilmemiş');
      }
      
      // Test with a simple ping workflow
      await triggerWorkflow({
        workflow: 'fetch_daily_invoices',
        parameters: { test: true }
      });
      
      setConnectionStatus('connected');
      toast.success('n8n bağlantısı başarılı!');
      
    } catch (error: any) {
      console.error('n8n connection test failed:', error);
      setConnectionStatus('error');
      toast.error('n8n bağlantı testi başarısız: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  // Generate webhook secret
  const generateWebhookSecret = () => {
    const secret = 'n8n_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    navigator.clipboard.writeText(secret);
    toast.success('Webhook secret kopyalandı');
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <Tabs defaultValue="settings" className="space-y-6">
      <TabsList>
        <TabsTrigger value="settings">Ayarlar</TabsTrigger>
        <TabsTrigger value="monitor">İzleme</TabsTrigger>
        <TabsTrigger value="help">Yardım</TabsTrigger>
      </TabsList>

      <TabsContent value="settings">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="h-6 w-6 text-orange-500" />
                n8n Otomasyonu Ayarları
              </h2>
              <p className="text-muted-foreground">Veriban işlemlerinizi n8n ile otomatikleştirin</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={testConnection} 
                disabled={testing || !settings.enabled}
                variant="outline"
                size="sm"
              >
                {testing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <TestTube className="h-4 w-4 mr-2" />}
                Bağlantıyı Test Et
              </Button>
              <Button onClick={saveSettings} disabled={loading} size="sm">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                Kaydet
              </Button>
            </div>
          </div>

          {/* Connection Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' : 
                    connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="font-medium">
                    n8n Bağlantı Durumu: {
                      connectionStatus === 'connected' ? 'Bağlı' :
                      connectionStatus === 'error' ? 'Hata' : 'Bilinmiyor'
                    }
                  </span>
                </div>
                <Badge variant={connectionStatus === 'connected' ? "default" : "secondary"}>
                  {connectionStatus === 'connected' ? "Aktif" : "Pasif"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Main Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Temel Ayarlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="n8n-enabled" className="text-base font-medium">n8n Otomasyonunu Etkinleştir</Label>
                  <p className="text-sm text-muted-foreground">Veriban işlemlerini n8n workflow'ları ile otomatikleştir</p>
                </div>
                <Switch
                  id="n8n-enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
                />
              </div>
              
              {!settings.enabled && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    n8n otomasyonu devre dışı. Etkinleştirmek için yukarıdaki anahtarı açın.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Webhook URLs */}
          {settings.enabled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Webhook URL'leri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Fatura Çekme Webhook</Label>
                  <Input
                    placeholder="https://your-n8n-instance.com/webhook/fetch-invoices"
                    value={settings.webhookUrls.fetchInvoices}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      webhookUrls: { ...prev.webhookUrls, fetchInvoices: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Durum Senkronizasyon Webhook</Label>
                  <Input
                    placeholder="https://your-n8n-instance.com/webhook/sync-status"
                    value={settings.webhookUrls.syncStatus}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      webhookUrls: { ...prev.webhookUrls, syncStatus: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>PDF İndirme Webhook</Label>
                  <Input
                    placeholder="https://your-n8n-instance.com/webhook/download-pdf"
                    value={settings.webhookUrls.downloadPdf}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      webhookUrls: { ...prev.webhookUrls, downloadPdf: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Bildirim Webhook</Label>
                  <Input
                    placeholder="https://your-n8n-instance.com/webhook/notification"
                    value={settings.webhookUrls.notification}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      webhookUrls: { ...prev.webhookUrls, notification: e.target.value }
                    }))}
                  />
                </div>
                
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    Webhook security için secret key kullanın. 
                    <Button variant="link" onClick={generateWebhookSecret} className="p-0 h-auto">
                      Secret oluştur ve kopyala
                    </Button>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Auto Sync Settings */}
          {settings.enabled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Otomatik Senkronizasyon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-sync" className="text-base font-medium">Otomatik Senkronizasyon</Label>
                    <p className="text-sm text-muted-foreground">Belirli aralıklarla otomatik fatura çekme</p>
                  </div>
                  <Switch
                    id="auto-sync"
                    checked={settings.autoSync.enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      autoSync: { ...prev.autoSync, enabled: checked }
                    }))}
                  />
                </div>
                
                {settings.autoSync.enabled && (
                  <>
                    <div>
                      <Label>Cron Schedule</Label>
                      <Input
                        placeholder="0 9 * * * (Her gün saat 9:00)"
                        value={settings.autoSync.schedule}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          autoSync: { ...prev.autoSync, schedule: e.target.value }
                        }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Cron format: dakika saat gün ay haftanın-günü
                      </p>
                    </div>
                    <div>
                      <Label>Zaman Dilimi</Label>
                      <Input
                        value={settings.autoSync.timezone}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          autoSync: { ...prev.autoSync, timezone: e.target.value }
                        }))}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {settings.enabled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Bildirim Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Slack Bildirimleri</Label>
                  <Switch
                    checked={settings.notifications.slack}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, slack: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Email Bildirimleri</Label>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Teams Bildirimleri</Label>
                  <Switch
                    checked={settings.notifications.teams}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, teams: checked }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      <TabsContent value="monitor">
        <WorkflowMonitor />
      </TabsContent>

      <TabsContent value="help">
        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              n8n Workflow Kurulum Rehberi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">1. n8n'de Webhook Trigger Oluşturun</h4>
                <p className="text-sm text-muted-foreground">
                  Her workflow için bir Webhook trigger node ekleyin ve URL'leri yukarıya yapıştırın.
                </p>
              </div>
              <div>
                <h4 className="font-medium">2. Veriban API Node'ları Ekleyin</h4>
                <p className="text-sm text-muted-foreground">
                  HTTP Request node'ları ile Veriban API çağrıları yapın (login, fetchInvoices, vb).
                </p>
              </div>
              <div>
                <h4 className="font-medium">3. Supabase Webhook Node'u Ekleyin</h4>
                <p className="text-sm text-muted-foreground">
                  Veriban'dan gelen verileri Supabase'e göndermek için webhook endpoint'imizi kullanın:
                </p>
                <code className="text-xs bg-muted p-2 rounded block mt-2">
                  https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/n8n-webhook
                </code>
              </div>
              <div>
                <h4 className="font-medium">4. Hata Yönetimi Ekleyin</h4>
                <p className="text-sm text-muted-foreground">
                  Retry logic ve error handling için gerekli node'ları ekleyin.
                </p>
              </div>
              <div>
                <h4 className="font-medium">5. Örnek Workflow JSON'u</h4>
                <p className="text-sm text-muted-foreground">
                  Temel bir Veriban fatura çekme workflow'u için örnek:
                </p>
                <Textarea 
                  readOnly
                  className="text-xs mt-2 h-32"
                  value={`{
  "name": "Veriban Daily Invoice Fetch",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "webhookId": "your-webhook-id"
    },
    {
      "name": "Veriban Login",
      "type": "n8n-nodes-base.httpRequest",
      "url": "https://veriban-proxy-url/login"
    },
    {
      "name": "Fetch Invoices", 
      "type": "n8n-nodes-base.httpRequest",
      "url": "https://veriban-proxy-url/getInvoices"
    },
    {
      "name": "Send to Supabase",
      "type": "n8n-nodes-base.httpRequest", 
      "url": "https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/n8n-webhook"
    }
  ]
}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default N8nSettingsPanel;