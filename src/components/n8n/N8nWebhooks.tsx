import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Trash2,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface WebhookUrl {
  id: string;
  name: string;
  url: string;
  description: string;
  active: boolean;
}

const N8nWebhooks: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load saved webhooks
  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preference_value')
          .eq('user_id', user.id)
          .eq('preference_key', 'n8n_webhooks')
          .single();
        
        if (data && data.preference_value) {
          setWebhooks(data.preference_value);
        }
      }
    } catch (error) {
      console.error('Error loading webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWebhooks = async () => {
    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            preference_key: 'n8n_webhooks',
            preference_value: webhooks
          });
        
        if (error) {
          throw error;
        }
      }
      
      toast.success('Webhook URL\'leri kaydedildi');
    } catch (error) {
      console.error('Error saving webhooks:', error);
      toast.error('Webhook\'lar kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const addWebhook = () => {
    const newWebhook: WebhookUrl = {
      id: Date.now().toString(),
      name: '',
      url: '',
      description: '',
      active: true
    };
    setWebhooks(prev => [...prev, newWebhook]);
  };

  const updateWebhook = (id: string, field: keyof WebhookUrl, value: string | boolean) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === id ? { ...webhook, [field]: value } : webhook
    ));
  };

  const removeWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== id));
  };

  const copyToClipboard = (url: string, name: string) => {
    navigator.clipboard.writeText(url);
    toast.success(`${name} URL'i kopyalandı`);
  };

  const testWebhook = async (webhook: WebhookUrl) => {
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          message: 'Test webhook from NGS'
        }),
      });

      if (response.ok) {
        toast.success(`${webhook.name} webhook testi başarılı`);
      } else {
        toast.error(`${webhook.name} webhook testi başarısız`);
      }
    } catch (error) {
      toast.error(`${webhook.name} webhook testi başarısız`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">n8n Webhook URL'leri</h2>
        <p className="text-muted-foreground">
          n8n'de oluşturduğunuz webhook URL'lerini buraya kaydedin
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <ExternalLink className="h-4 w-4" />
        <AlertDescription>
          <strong>Nasıl kullanılır:</strong> n8n.cloud'da workflow oluşturun, webhook trigger ekleyin 
          ve URL'ini buraya kaydedin. Sistem bu webhook'ları kullanarak n8n workflow'larınızı tetikleyecek.
        </AlertDescription>
      </Alert>

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Name */}
                <div>
                  <Label htmlFor={`name-${webhook.id}`}>Webhook Adı</Label>
                  <Input
                    id={`name-${webhook.id}`}
                    placeholder="Örn: Fatura Çekme Webhook"
                    value={webhook.name}
                    onChange={(e) => updateWebhook(webhook.id, 'name', e.target.value)}
                  />
                </div>

                {/* URL */}
                <div>
                  <Label htmlFor={`url-${webhook.id}`}>Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`url-${webhook.id}`}
                      placeholder="https://your-n8n-instance.com/webhook/..."
                      value={webhook.url}
                      onChange={(e) => updateWebhook(webhook.id, 'url', e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(webhook.url, webhook.name)}
                      disabled={!webhook.url}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testWebhook(webhook)}
                      disabled={!webhook.url}
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor={`desc-${webhook.id}`}>Açıklama</Label>
                  <Input
                    id={`desc-${webhook.id}`}
                    placeholder="Bu webhook ne için kullanılıyor?"
                    value={webhook.description}
                    onChange={(e) => updateWebhook(webhook.id, 'description', e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`active-${webhook.id}`}
                      checked={webhook.active}
                      onChange={(e) => updateWebhook(webhook.id, 'active', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor={`active-${webhook.id}`} className="text-sm">
                      Aktif
                    </Label>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeWebhook(webhook.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Webhook */}
        <Button 
          onClick={addWebhook} 
          variant="outline" 
          className="w-full"
        >
          <Zap className="h-4 w-4 mr-2" />
          Yeni Webhook Ekle
        </Button>
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <Button 
          onClick={saveWebhooks} 
          disabled={saving || loading}
          className="px-8"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Webhook'ları Kaydet
        </Button>
      </div>
    </div>
  );
};

export default N8nWebhooks; 