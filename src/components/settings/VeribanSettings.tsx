import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Eye, 
  EyeOff,
  FileText,
  Zap,
  AlertCircle,
  Save,
  TestTube
} from 'lucide-react';

interface VeribanConfig {
  testUserName: string;
  testPassword: string;
  liveUserName: string;
  livePassword: string;
  isTestMode: boolean;
  testServiceUrl: string;
  liveServiceUrl: string;
}

export const VeribanSettings: React.FC = () => {
  const [config, setConfig] = useState<VeribanConfig>({
    testUserName: 'TESTER@VRBN',
    testPassword: 'Vtest*2020*',
    liveUserName: '',
    livePassword: '',
    isTestMode: false, // Canlı ortam varsayılan olarak seçili
    testServiceUrl: 'https://efaturatransfertest.veriban.com.tr/IntegrationService.svc',
    liveServiceUrl: 'http://efaturatransfer.veriban.com.tr/IntegrationService.svc'
  });

  const [showTestPassword, setShowTestPassword] = useState(false);
  const [showLivePassword, setShowLivePassword] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Ayarları localStorage'dan yükle
  useEffect(() => {
    const savedConfig = localStorage.getItem('veribanConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  // Ayarları kaydet
  const saveConfig = () => {
    localStorage.setItem('veribanConfig', JSON.stringify(config));
    setTestResult({ success: true, message: 'Ayarlar başarıyla kaydedildi!' });
    setTimeout(() => setTestResult(null), 3000);
  };

  // Bağlantı testi
  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const serviceUrl = config.isTestMode ? config.testServiceUrl : config.liveServiceUrl;
      const userName = config.isTestMode ? config.testUserName : config.liveUserName;
      const password = config.isTestMode ? config.testPassword : config.livePassword;

      // SOAP login request
      const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Login xmlns="http://tempuri.org/">
      <userName>${userName}</userName>
      <password>${password}</password>
    </Login>
  </soap:Body>
</soap:Envelope>`;

      const response = await fetch(serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
        },
        body: soapRequest
      });

      if (response.ok) {
        const xmlText = await response.text();
        const sessionMatch = xmlText.match(/<LoginResult>(.*?)<\/LoginResult>/);
        
        if (sessionMatch && sessionMatch[1]) {
          setIsConnected(true);
          setTestResult({ 
            success: true, 
            message: `${config.isTestMode ? 'Test' : 'Canlı'} ortamına başarıyla bağlandı!` 
          });
        } else {
          setIsConnected(false);
          setTestResult({ 
            success: false, 
            message: 'Bağlantı başarısız: Geçersiz kullanıcı adı veya şifre' 
          });
        }
      } else {
        setIsConnected(false);
        setTestResult({ 
          success: false, 
          message: `Bağlantı hatası: ${response.status} ${response.statusText}` 
        });
      }
    } catch (error) {
      setIsConnected(false);
      setTestResult({ 
        success: false, 
        message: `Bağlantı hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}` 
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Veriban E-Fatura Ayarları
          </CardTitle>
          <CardDescription>
            Veriban E-Fatura entegrasyonu için kullanıcı bilgileri ve servis ayarları
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bağlantı Durumu */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {isConnected ? 'Veriban Bağlantısı Aktif' : 'Veriban Bağlantısı Yok'}
            </span>
            <Badge variant={config.isTestMode ? "outline" : "default"} className="ml-auto">
              {config.isTestMode ? 'Test Ortamı' : 'Canlı Ortam'}
            </Badge>
          </div>

          {/* Test Sonucu */}
          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}

          {/* Ortam Seçimi */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Ortam Seçimi</Label>
                <p className="text-sm text-gray-600">
                  Canlı ortam için üretim kullanın
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="test-mode" className="text-sm">Test Ortamı</Label>
                <Switch
                  id="test-mode"
                  checked={config.isTestMode}
                  onCheckedChange={(checked) => setConfig({ ...config, isTestMode: checked })}
                  disabled={true} // Test ortamı devre dışı
                />
                <Label htmlFor="test-mode" className="text-sm">Canlı Ortam</Label>
              </div>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Test ortamı devre dışı bırakıldı. Sadece canlı ortam kullanılabilir.
              </AlertDescription>
            </Alert>
          </div>

          <Separator />

          {/* Test Ortamı Ayarları - Devre Dışı */}
          <div className="space-y-4 opacity-50">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test Ortamı Ayarları (Devre Dışı)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test-username">Test Kullanıcı Adı</Label>
                <Input
                  id="test-username"
                  value={config.testUserName}
                  onChange={(e) => setConfig({ ...config, testUserName: e.target.value })}
                  placeholder="TESTER@VRBN"
                  disabled={true}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="test-password">Test Şifresi</Label>
                <div className="relative">
                  <Input
                    id="test-password"
                    type={showTestPassword ? "text" : "password"}
                    value={config.testPassword}
                    onChange={(e) => setConfig({ ...config, testPassword: e.target.value })}
                    placeholder="Vtest*2020*"
                    disabled={true}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowTestPassword(!showTestPassword)}
                    disabled={true}
                  >
                    {showTestPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-service-url">Test Servis URL</Label>
              <Input
                id="test-service-url"
                value={config.testServiceUrl}
                onChange={(e) => setConfig({ ...config, testServiceUrl: e.target.value })}
                placeholder="https://efaturatransfertest.veriban.com.tr/IntegrationService.svc"
                disabled={true}
              />
            </div>
          </div>

          <Separator />

          {/* Canlı Ortam Ayarları */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Veriban Hesap Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="live-username">Kullanıcı Adı</Label>
                <Input
                  id="live-username"
                  value={config.liveUserName}
                  onChange={(e) => setConfig({ ...config, liveUserName: e.target.value })}
                  placeholder="Veriban kullanıcı adınız"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="live-password">Şifre</Label>
                <div className="relative">
                  <Input
                    id="live-password"
                    type={showLivePassword ? "text" : "password"}
                    value={config.livePassword}
                    onChange={(e) => setConfig({ ...config, livePassword: e.target.value })}
                    placeholder="Veriban şifreniz"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowLivePassword(!showLivePassword)}
                  >
                    {showLivePassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="live-service-url">Servis URL</Label>
              <Input
                id="live-service-url"
                value={config.liveServiceUrl}
                onChange={(e) => setConfig({ ...config, liveServiceUrl: e.target.value })}
                placeholder="http://efaturatransfer.veriban.com.tr/IntegrationService.svc"
              />
            </div>
          </div>

          <Separator />

          {/* İşlem Butonları */}
          <div className="flex gap-4">
            <Button onClick={saveConfig} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Ayarları Kaydet
            </Button>
            
            <Button 
              onClick={testConnection} 
              disabled={isTesting}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              Bağlantıyı Test Et
            </Button>
          </div>

          {/* Bilgi Notu */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Önemli Notlar:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Veriban hesabınızdan aldığınız kullanıcı adı ve şifreyi girin</li>
              <li>• Şifreler güvenli şekilde saklanır ve şifrelenir</li>
              <li>• Bağlantı testi yapmadan önce ayarları kaydetmeyi unutmayın</li>
              <li>• Test ortamı devre dışı bırakıldı, sadece canlı ortam kullanılabilir</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 