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
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';

interface N8nCredentials {
  instanceUrl: string;
  username: string;
  password: string;
}

const N8nLogin: React.FC = () => {
  const [credentials, setCredentials] = useState<N8nCredentials>({
    instanceUrl: '',
    username: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load saved credentials
  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preference_value')
          .eq('user_id', user.id)
          .eq('preference_key', 'n8n_credentials')
          .single();
        
        if (data && data.preference_value) {
          setCredentials(data.preference_value);
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.error('Error loading n8n credentials:', error);
    }
  };

  const saveCredentials = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            preference_key: 'n8n_credentials',
            preference_value: credentials
          });
        
        if (error) {
          throw error;
        }
      }
      
      toast.success('n8n bilgileri kaydedildi');
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast.error('Bilgiler kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setTesting(true);
      
      if (!credentials.instanceUrl || !credentials.username || !credentials.password) {
        toast.error('Lütfen tüm alanları doldurun');
        return;
      }

      // Clean URL
      const baseUrl = credentials.instanceUrl.replace(/\/$/, '');
      
      // Test 1: Check if n8n instance is reachable
      const healthResponse = await fetch(`${baseUrl}/healthz`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!healthResponse.ok) {
        throw new Error(`n8n instance'a erişilemiyor (${healthResponse.status})`);
      }

      // Test 2: Try to authenticate
      const loginResponse = await fetch(`${baseUrl}/rest/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.username,
          password: credentials.password,
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.text();
        throw new Error(`Giriş başarısız: ${errorData}`);
      }

      const loginData = await loginResponse.json();
      
      setIsConnected(true);
      toast.success('n8n bağlantısı başarılı!');
      
      // Save credentials after successful test
      await saveCredentials();
      
    } catch (error: any) {
      console.error('n8n connection test failed:', error);
      setIsConnected(false);
      toast.error('Bağlantı testi başarısız: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  const updateCredential = (field: keyof N8nCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          n8n Giriş
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <Alert>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
            <AlertDescription>
              {isConnected ? 'n8n bağlantısı aktif' : 'n8n bağlantısı yok'}
            </AlertDescription>
          </div>
        </Alert>

        {/* Instance URL */}
        <div className="space-y-2">
          <Label htmlFor="instanceUrl">n8n Instance URL</Label>
          <Input
            id="instanceUrl"
            type="url"
            placeholder="https://your-n8n-instance.com"
            value={credentials.instanceUrl}
            onChange={(e) => updateCredential('instanceUrl', e.target.value)}
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Kullanıcı Adı</Label>
          <Input
            id="username"
            type="text"
            placeholder="n8n kullanıcı adınız"
            value={credentials.username}
            onChange={(e) => updateCredential('username', e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="n8n şifreniz"
              value={credentials.password}
              onChange={(e) => updateCredential('password', e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={testConnection} 
            disabled={testing || loading}
            className="flex-1"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Bağlantı Test Et
          </Button>
          
          <Button 
            variant="outline" 
            onClick={saveCredentials} 
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Kaydet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default N8nLogin; 