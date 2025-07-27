import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { useN8nTrigger } from '../../hooks/useN8nTrigger';
import { 
  Shield, 
  Key, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  TestTube,
  Wifi
} from 'lucide-react';

interface Secret {
  name: string;
  value: string;
  masked: boolean;
  description: string;
  required: boolean;
}

const N8nSecretsManager: React.FC = () => {
  const [secrets, setSecrets] = useState<Secret[]>([
    {
      name: 'N8N_INSTANCE_URL',
      value: '',
      masked: false,
      description: 'n8n instance URL\'si (örn: https://your-n8n.com)',
      required: true
    },
    {
      name: 'N8N_USERNAME',
      value: '',
      masked: false,
      description: 'n8n kullanıcı adı/email',
      required: true
    },
    {
      name: 'N8N_PASSWORD',
      value: '',
      masked: true,
      description: 'n8n şifresi',
      required: true
    },
    {
      name: 'N8N_API_KEY',
      value: '',
      masked: true,
      description: 'n8n API anahtarı (isteğe bağlı, API kullanımı için)',
      required: false
    },
    {
      name: 'N8N_WEBHOOK_SECRET',
      value: '',
      masked: true,
      description: 'n8n webhook\'ları için güvenlik anahtarı',
      required: true
    },
    {
      name: 'N8N_FETCH_INVOICES_WEBHOOK',
      value: '',
      masked: false,
      description: 'Günlük fatura çekme workflow webhook URL\'si',
      required: true
    },
    {
      name: 'N8N_SYNC_STATUS_WEBHOOK',
      value: '',
      masked: false,
      description: 'Fatura durumu senkronizasyonu webhook URL\'si',
      required: true
    },
    {
      name: 'N8N_DOWNLOAD_PDF_WEBHOOK',
      value: '',
      masked: false,
      description: 'PDF indirme workflow webhook URL\'si',
      required: false
    },
    {
      name: 'N8N_NOTIFICATION_WEBHOOK',
      value: '',
      masked: false,
      description: 'Bildirim gönderme workflow webhook URL\'si',
      required: false
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [showValues, setShowValues] = useState<{ [key: string]: boolean }>({});

  const { testN8nConnection } = useN8nTrigger();

  // Load secrets from environment or local storage
  const loadSecrets = async () => {
    try {
      setLoading(true);
      
      // Try to load from user preferences or localStorage
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preference_value')
          .eq('user_id', user.id)
          .eq('preference_key', 'n8n_secrets')
          .single();
        
        if (data && data.preference_value) {
          const savedSecrets = data.preference_value as Secret[];
          setSecrets(prev => prev.map(secret => {
            const saved = savedSecrets.find(s => s.name === secret.name);
            return saved ? { ...secret, value: saved.value } : secret;
          }));
        }
      }
      
      // Also check localStorage as fallback
      const localSecrets = localStorage.getItem('n8n-secrets');
      if (localSecrets) {
        const parsed = JSON.parse(localSecrets);
        setSecrets(prev => prev.map(secret => {
          const local = parsed.find((s: Secret) => s.name === secret.name);
          return local ? { ...secret, value: local.value } : secret;
        }));
      }
    } catch (error) {
      console.error('Error loading secrets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save secrets
  const saveSecrets = async () => {
    try {
      setLoading(true);
      
      // Save to localStorage
      localStorage.setItem('n8n-secrets', JSON.stringify(secrets));
      
      // Save to user preferences
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            preference_key: 'n8n_secrets',
            preference_value: secrets
          });
        
        if (error) {
          console.error('Error saving to database:', error);
        }
      }
      
      toast.success('n8n secrets kaydedildi');
    } catch (error) {
      console.error('Error saving secrets:', error);
      toast.error('Secrets kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  // Update secret value
  const updateSecret = (name: string, value: string) => {
    setSecrets(prev => prev.map(secret => 
      secret.name === name ? { ...secret, value } : secret
    ));
  };

  // Toggle visibility
  const toggleVisibility = (name: string) => {
    setShowValues(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Generate random secret
  const generateSecret = (name: string) => {
    const secret = 'sec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    updateSecret(name, secret);
  };

  // Copy to clipboard
  const copyToClipboard = (value: string, name: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${name} kopyalandı`);
  };

  // Calculate completion
  const getCompletionPercentage = () => {
    const requiredSecrets = secrets.filter(s => s.required);
    const completedRequired = requiredSecrets.filter(s => s.value.trim() !== '');
    return requiredSecrets.length > 0 ? (completedRequired.length / requiredSecrets.length) * 100 : 100;
  };

  const getSecretStatus = (secret: Secret) => {
    if (secret.required && !secret.value.trim()) {
      return { status: 'error', message: 'Gerekli' };
    } else if (secret.value.trim()) {
      return { status: 'success', message: 'Yapılandırıldı' };
    } else {
      return { status: 'warning', message: 'İsteğe bağlı' };
    }
  };

  // Test n8n connection using current secrets
  const testConnection = async () => {
    try {
      setTesting(true);
      setConnectionStatus('unknown');

      // Get credentials from current secrets
      const instanceUrl = secrets.find(s => s.name === 'N8N_INSTANCE_URL')?.value;
      const username = secrets.find(s => s.name === 'N8N_USERNAME')?.value;
      const password = secrets.find(s => s.name === 'N8N_PASSWORD')?.value;
      const apiKey = secrets.find(s => s.name === 'N8N_API_KEY')?.value;

      if (!instanceUrl || !username || !password) {
        throw new Error('n8n bilgileri eksik: URL, kullanıcı adı ve şifre gerekli');
      }

      const result = await testN8nConnection({
        instanceUrl,
        username,
        password,
        apiKey
      });

      if (result.success) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }

    } catch (error: any) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    loadSecrets();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            n8n Secrets Yönetimi
          </h3>
          <p className="text-muted-foreground">n8n kimlik bilgileri, webhook URL'leri ve güvenlik anahtarlarını yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={testConnection} 
            disabled={testing || loading}
          >
            {testing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            Bağlantı Test Et
          </Button>
          <Button onClick={saveSecrets} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
            Kaydet
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : connectionStatus === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Wifi className="h-5 w-5 text-gray-400" />
              )}
              <span className="font-medium">
                {connectionStatus === 'connected' ? 'Bağlı' : 
                 connectionStatus === 'error' ? 'Bağlantı Hatası' : 'Bilinmiyor'}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Yapılandırma İlerlemesi</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(getCompletionPercentage())}% tamamlandı
                </span>
              </div>
              <Progress value={getCompletionPercentage()} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secrets List */}
      <div className="space-y-4">
        {secrets.map((secret) => {
          const { status, message } = getSecretStatus(secret);
          const isVisible = showValues[secret.name];
          const isAuthField = ['N8N_INSTANCE_URL', 'N8N_USERNAME', 'N8N_PASSWORD', 'N8N_API_KEY'].includes(secret.name);
          
          return (
            <Card key={secret.name} className={isAuthField ? 'border-primary/20 bg-primary/5' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {secret.name}
                      </code>
                      <Badge 
                        variant={
                          status === 'success' ? 'default' : 
                          status === 'error' ? 'destructive' : 'secondary'
                        }
                      >
                        {message}
                      </Badge>
                      {secret.required && (
                        <Badge variant="outline">Gerekli</Badge>
                      )}
                      {isAuthField && (
                        <Badge variant="secondary">Authentication</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {secret.description}
                    </p>
                    
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type={secret.masked && !isVisible ? "password" : "text"}
                          value={secret.value}
                          onChange={(e) => updateSecret(secret.name, e.target.value)}
                          placeholder={`${secret.name} değerini girin...`}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                        {secret.masked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-6 w-6 p-0"
                            onClick={() => toggleVisibility(secret.name)}
                          >
                            {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        {secret.name.includes('SECRET') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateSecret(secret.name)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {secret.value && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(secret.value, secret.name)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateSecret(secret.name, '')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Güvenlik Uyarısı:</strong> Bu değerler hassas bilgilerdir. 
          Sadece güvenilir n8n instance'larınızda kullanın ve asla public repository'lerde paylaşmayın.
        </AlertDescription>
      </Alert>

      {/* Quick Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hızlı Kurulum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium mb-2">1. n8n Instance Bilgilerini Girin</h4>
            <p className="text-sm text-muted-foreground">
              n8n instance URL'si, kullanıcı adı ve şifrenizi yukarıdaki authentication alanlarına girin.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">2. Webhook URL'lerini Alın</h4>
            <p className="text-sm text-muted-foreground">
              n8n'de workflow'larınızı oluşturduktan sonra webhook URL'lerini ilgili alanlara girin.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">3. Webhook Secret Oluşturun</h4>
            <p className="text-sm text-muted-foreground">
              Güvenlik için secret key oluşturun ve hem n8n'de hem de burada aynı değeri kullanın.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">4. Bağlantıyı Test Edin</h4>
            <p className="text-sm text-muted-foreground">
              Tüm bilgileri girdikten sonra "Bağlantı Test Et" butonuna tıklayarak n8n ile bağlantınızı doğrulayın.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default N8nSecretsManager;