import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { CheckCircle, AlertCircle, Copy, ExternalLink, Download } from 'lucide-react';
import { toast } from 'sonner';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  optional?: boolean;
}

const N8nSetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [n8nUrl, setN8nUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'n8n-instance',
      title: 'n8n Instance Kurulumu',
      description: 'n8n instance\'ınızı kurun ve erişim URL\'sini alın',
      completed: false
    },
    {
      id: 'webhook-setup',
      title: 'Webhook Konfigürasyonu',
      description: 'Webhook URL\'lerini yapılandırın ve güvenlik ayarlarını yapın',
      completed: false
    },
    {
      id: 'workflow-import',
      title: 'Workflow Template İçe Aktarma',
      description: 'Hazır Veriban workflow\'larını n8n\'e aktarın',
      completed: false
    },
    {
      id: 'test-connection',
      title: 'Bağlantı Testi',
      description: 'n8n ve Supabase arasındaki bağlantıyı test edin',
      completed: false
    },
    {
      id: 'schedule-setup',
      title: 'Zamanlama Ayarları',
      description: 'Otomatik fatura çekme zamanlamasını yapılandırın',
      completed: false,
      optional: true
    }
  ]);

  const calculateProgress = () => {
    const completedSteps = steps.filter(step => step.completed).length;
    return (completedSteps / steps.length) * 100;
  };

  const markStepCompleted = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
  };

  const generateWebhookSecret = () => {
    const secret = 'wh_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setWebhookSecret(secret);
    navigator.clipboard.writeText(secret);
    toast.success('Webhook secret oluşturuldu ve kopyalandı');
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const downloadWorkflowTemplate = (workflowName: string) => {
    const workflows = {
      'veriban-daily-fetch': {
        name: 'Veriban Daily Invoice Fetch',
        nodes: [
          {
            parameters: {
              httpMethod: 'POST',
              path: 'daily-fetch',
              options: {}
            },
            id: 'webhook-trigger',
            name: 'Webhook Trigger',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [240, 300]
          },
          {
            parameters: {
              url: 'https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/veriban-proxy',
              options: {
                headers: {
                  'Content-Type': 'application/json'
                }
              },
              body: {
                action: 'login'
              }
            },
            id: 'veriban-login',
            name: 'Veriban Login',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 4.1,
            position: [460, 300]
          },
          {
            parameters: {
              url: 'https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/veriban-proxy',
              options: {
                headers: {
                  'Content-Type': 'application/json'
                }
              },
              body: {
                action: 'getIncomingInvoices',
                startDate: '={{ new Date().toISOString().split("T")[0] }}',
                endDate: '={{ new Date().toISOString().split("T")[0] }}'
              }
            },
            id: 'fetch-invoices',
            name: 'Fetch Today Invoices',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 4.1,
            position: [680, 300]
          },
          {
            parameters: {
              url: 'https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/n8n-webhook',
              options: {
                headers: {
                  'Content-Type': 'application/json'
                }
              },
              body: {
                action: 'invoice_batch_received',
                data: {
                  invoices: '={{ $json.invoices }}',
                  user_id: '={{ $json.user_id }}'
                },
                auth_token: webhookSecret
              }
            },
            id: 'send-to-supabase',
            name: 'Send to Supabase',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 4.1,
            position: [900, 300]
          }
        ],
        connections: {
          'Webhook Trigger': {
            main: [[{ node: 'Veriban Login', type: 'main', index: 0 }]]
          },
          'Veriban Login': {
            main: [[{ node: 'Fetch Today Invoices', type: 'main', index: 0 }]]
          },
          'Fetch Today Invoices': {
            main: [[{ node: 'Send to Supabase', type: 'main', index: 0 }]]
          }
        }
      }
    };

    const workflow = workflows[workflowName as keyof typeof workflows];
    if (workflow) {
      const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workflowName}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Workflow template indirildi');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>n8n Kurulum Sihirbazı</CardTitle>
          <div className="flex items-center gap-4">
            <Progress value={calculateProgress()} className="flex-1" />
            <span className="text-sm text-muted-foreground">
              {steps.filter(s => s.completed).length} / {steps.length} tamamlandı
            </span>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kurulum Adımları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  currentStep === index ? 'bg-primary/10' : 'hover:bg-muted/50'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <div className="mt-0.5">
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      currentStep === index ? 'border-primary bg-primary/20' : 'border-muted-foreground'
                    }`} />
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                  {step.optional && (
                    <Badge variant="secondary" className="mt-1 text-xs">İsteğe Bağlı</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>1. n8n Instance Kurulumu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    n8n'i kendi sunucunuzda çalıştırabilir veya n8n Cloud kullanabilirsiniz.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Seçenek 1: n8n Cloud (Önerilen)</h4>
                    <div className="text-sm text-muted-foreground mb-2">
                      En kolay kurulum yöntemi. 14 gün ücretsiz deneme.
                    </div>
                    <Button variant="outline" onClick={() => window.open('https://n8n.cloud', '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      n8n Cloud'a Git
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Seçenek 2: Docker ile Self-Host</h4>
                    <div className="text-sm text-muted-foreground mb-2">
                      Kendi sunucunuzda çalıştırın:
                    </div>
                    <code className="block bg-muted p-2 rounded text-sm">
                      docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
                    </code>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => copyToClipboard('docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n', 'Docker komutu kopyalandı')}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Kopyala
                    </Button>
                  </div>

                  <div>
                    <Label>n8n Instance URL'si</Label>
                    <Input
                      placeholder="https://your-instance.n8n.cloud veya http://localhost:5678"
                      value={n8nUrl}
                      onChange={(e) => setN8nUrl(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={() => {
                      if (n8nUrl) {
                        markStepCompleted('n8n-instance');
                        setCurrentStep(1);
                      } else {
                        toast.error('Lütfen n8n URL\'sini girin');
                      }
                    }}
                    disabled={!n8nUrl}
                  >
                    Devam Et
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>2. Webhook Konfigürasyonu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Webhook Secret Key</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Güvenlik için secret key"
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                    />
                    <Button variant="outline" onClick={generateWebhookSecret}>
                      Oluştur
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Bu secret key'i n8n workflow'larınızda kullanacaksınız. Güvenli bir yerde saklayın.
                  </AlertDescription>
                </Alert>

                <div>
                  <h4 className="font-medium mb-2">Supabase Webhook Endpoint</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/n8n-webhook</code>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2"
                      onClick={() => copyToClipboard(
                        'https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/n8n-webhook',
                        'Webhook URL kopyalandı'
                      )}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    if (webhookSecret) {
                      markStepCompleted('webhook-setup');
                      setCurrentStep(2);
                    } else {
                      toast.error('Lütfen webhook secret oluşturun');
                    }
                  }}
                  disabled={!webhookSecret}
                >
                  Devam Et
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>3. Workflow Template İçe Aktarma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Hazır Workflow Şablonları</h4>
                  <div className="grid gap-3">
                    <div className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Günlük Fatura Çekme</div>
                          <div className="text-sm text-muted-foreground">Her gün otomatik fatura çeker</div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadWorkflowTemplate('veriban-daily-fetch')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          İndir
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    İndirilen JSON dosyalarını n8n arayüzünde "Import from File" ile içe aktarın.
                  </AlertDescription>
                </Alert>

                <div>
                  <h4 className="font-medium mb-2">Manuel Kurulum Adımları</h4>
                  <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                    <li>n8n'de yeni workflow oluşturun</li>
                    <li>Webhook trigger node ekleyin</li>
                    <li>HTTP Request node'ları ile Veriban API çağrıları yapın</li>
                    <li>Supabase webhook'a veri gönderin</li>
                    <li>Hata yönetimi ve retry logic ekleyin</li>
                  </ol>
                </div>

                <Button 
                  onClick={() => {
                    markStepCompleted('workflow-import');
                    setCurrentStep(3);
                  }}
                >
                  Template'leri İndirdim, Devam Et
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>4. Bağlantı Testi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    n8n workflow'larınızı aktifleştirin ve test edin.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Test Checklist</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Webhook trigger aktif</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Veriban login çalışıyor</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Fatura çekme başarılı</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Supabase'e veri geldi</span>
                      </label>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    markStepCompleted('test-connection');
                    setCurrentStep(4);
                  }}
                >
                  Test Tamamlandı, Devam Et
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>5. Zamanlama Ayarları (İsteğe Bağlı)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Cron Schedule Örnekleri</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <code>0 9 * * *</code>
                      <span className="text-muted-foreground">Her gün saat 09:00</span>
                    </div>
                    <div className="flex justify-between">
                      <code>0 9,17 * * 1-5</code>
                      <span className="text-muted-foreground">Hafta içi 09:00 ve 17:00</span>
                    </div>
                    <div className="flex justify-between">
                      <code>0 */2 * * *</code>
                      <span className="text-muted-foreground">Her 2 saatte bir</span>
                    </div>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Kurulum tamamlandı! Artık n8n ile Veriban otomasyonunuz hazır.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={() => {
                    markStepCompleted('schedule-setup');
                    toast.success('n8n kurulumu başarıyla tamamlandı!');
                  }}
                >
                  Kurulumu Tamamla
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default N8nSetupWizard;