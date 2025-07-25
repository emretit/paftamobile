import React, { useState, useEffect } from 'react';
import { useVeribanEInvoice } from '../../hooks/useVeribanEInvoice';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Send, 
  Download, 
  Eye,
  MessageSquare,
  Users,
  Settings,
  TestTube
} from 'lucide-react';
import { generateInvoiceXML, createSampleInvoiceData, generateInvoiceResponseXML } from '../../services/veriban/xmlTemplates';
import { getTransferStateMessage, getInvoiceStateMessage, getAnswerTypeMessage } from '../../services/veriban/types';

export const VeribanEInvoicePanel: React.FC = () => {
  const {
    loading,
    error,
    login,
    sendInvoice,
    sendDocumentFile,
    getTransferStatus,
    getInvoiceStatus,
    getIncomingInvoices,
    answerInvoice,
    downloadInvoice,
    getCustomerAliasInfo,
    logout,
    clearError
  } = useVeribanEInvoice();

  // State variables
  const [xmlContent, setXmlContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [customerAlias, setCustomerAlias] = useState('');
  const [transferId, setTransferId] = useState('');
  const [invoiceUUID, setInvoiceUUID] = useState('');
  const [customerVkn, setCustomerVkn] = useState('');
  const [transferStatus, setTransferStatus] = useState<any>(null);
  const [invoiceStatus, setInvoiceStatus] = useState<any>(null);
  const [incomingInvoices, setIncomingInvoices] = useState<any[]>([]);
  const [customerAliases, setCustomerAliases] = useState<any[]>([]);
  const [answerNote, setAnswerNote] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('send');

  // Sayfa yüklendiğinde otomatik giriş yap
  useEffect(() => {
    const initializeVeriban = async () => {
      const loginSuccess = await login();
      if (loginSuccess) {
        setIsLoggedIn(true);
        await handleGetIncomingInvoices();
      }
    };
    
    initializeVeriban();
  }, []);

  const handleLogin = async () => {
    const success = await login();
    if (success) {
      setIsLoggedIn(true);
      alert('Başarıyla giriş yapıldı!');
      await handleGetIncomingInvoices();
    }
  };

  const handleSendInvoice = async () => {
    if (!xmlContent || !fileName) {
      alert('XML içeriği ve dosya adı gereklidir!');
      return;
    }

    const result = await sendInvoice(xmlContent, fileName, customerAlias);
    if (result) {
      alert(`Fatura gönderildi! Transfer ID: ${result.transferFileUniqueId}`);
      setTransferId(result.transferFileUniqueId);
    }
  };

  const handleSendDocumentFile = async () => {
    if (!xmlContent || !fileName) {
      alert('XML içeriği ve dosya adı gereklidir!');
      return;
    }

    const result = await sendDocumentFile(xmlContent, fileName, customerAlias, true, false);
    if (result) {
      alert(`Doküman gönderildi! UUID: ${result.documentUUID}, Numara: ${result.documentNumber}`);
      setInvoiceUUID(result.documentUUID);
    }
  };

  const handleCheckTransferStatus = async () => {
    if (!transferId) {
      alert('Transfer ID gereklidir!');
      return;
    }

    const status = await getTransferStatus(transferId);
    if (status) {
      setTransferStatus(status);
    }
  };

  const handleCheckInvoiceStatus = async () => {
    if (!invoiceUUID) {
      alert('Fatura UUID gereklidir!');
      return;
    }

    const status = await getInvoiceStatus(invoiceUUID);
    if (status) {
      setInvoiceStatus(status);
    }
  };

  const handleGetIncomingInvoices = async () => {
    const invoices = await getIncomingInvoices();
    setIncomingInvoices(invoices);
  };

  const handleGetCustomerAliases = async () => {
    if (!customerVkn) {
      alert('Müşteri VKN gereklidir!');
      return;
    }

    const aliases = await getCustomerAliasInfo(customerVkn);
    setCustomerAliases(aliases);
  };

  const handleAnswerInvoice = async (uuid: string, answerType: 'ACCEPTED' | 'REJECTED') => {
    const result = await answerInvoice(uuid, answerType, answerNote);
    if (result && result.operationCompleted) {
      alert(`Fatura ${answerType === 'ACCEPTED' ? 'kabul edildi' : 'reddedildi'}!`);
      await handleGetIncomingInvoices();
    }
  };

  const handleDownloadInvoice = async () => {
    if (!invoiceUUID) {
      alert('Fatura UUID gereklidir!');
      return;
    }

    const result = await downloadInvoice(invoiceUUID);
    if (result && result.downloadFileReady) {
      alert('Fatura indirilmeye hazır!');
    }
  };

  const generateSampleXML = () => {
    const sampleData = createSampleInvoiceData();
    const xml = generateInvoiceXML(sampleData);
    setXmlContent(xml);
    setFileName(`SAMPLE_${sampleData.invoiceNumber}`);
  };

  const generateResponseXML = () => {
    if (!invoiceUUID) {
      alert('Fatura UUID gereklidir!');
      return;
    }
    const responseXml = generateInvoiceResponseXML(invoiceUUID, 'KABUL', 'Test cevabı');
    setXmlContent(responseXml);
    setFileName(`RESPONSE_${Date.now()}`);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Veriban E-Fatura Entegrasyonu
          </CardTitle>
          <CardDescription>
            E-Fatura gönderimi, durum sorgulama ve gelen fatura yönetimi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Bağlantı Durumu */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${isLoggedIn ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {isLoggedIn ? 'Veriban Bağlantısı Aktif' : 'Veriban Bağlantısı Yok'}
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleLogin} 
              disabled={loading}
              className="ml-auto"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Yeniden Bağlan
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="send">
                <Send className="h-4 w-4 mr-2" />
                Gönder
              </TabsTrigger>
              <TabsTrigger value="status">
                <Eye className="h-4 w-4 mr-2" />
                Durum
              </TabsTrigger>
              <TabsTrigger value="incoming">
                <Download className="h-4 w-4 mr-2" />
                Gelen
              </TabsTrigger>
              <TabsTrigger value="customer">
                <Users className="h-4 w-4 mr-2" />
                Müşteri
              </TabsTrigger>
              <TabsTrigger value="test">
                <TestTube className="h-4 w-4 mr-2" />
                Test
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Ayarlar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="send" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fatura Gönderimi</CardTitle>
                  <CardDescription>XML fatura dosyası gönderimi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                <div>
                      <Label htmlFor="fileName">Dosya Adı</Label>
                      <Input
                        id="fileName"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="fatura_001"
                      />
                </div>
                    <div>
                      <Label htmlFor="customerAlias">Müşteri Etiket (Opsiyonel)</Label>
                      <Input
                        id="customerAlias"
                        value={customerAlias}
                        onChange={(e) => setCustomerAlias(e.target.value)}
                        placeholder="urn:mail:defaultpk@veriban.com.tr"
                      />
                              </div>
                            </div>
                            
                  <div>
                    <Label htmlFor="xmlContent">XML İçeriği</Label>
                    <Textarea
                      id="xmlContent"
                      value={xmlContent}
                      onChange={(e) => setXmlContent(e.target.value)}
                      placeholder="Fatura XML içeriğini buraya yapıştırın..."
                      rows={10}
                    />
                              </div>
                              
                  <div className="flex gap-2">
                    <Button onClick={handleSendInvoice} disabled={loading}>
                      <Send className="h-4 w-4 mr-2" />
                      Transfer Gönder (Eski API)
                    </Button>
                    <Button onClick={handleSendDocumentFile} disabled={loading}>
                      <Send className="h-4 w-4 mr-2" />
                      Doküman Gönder (Yeni API)
                    </Button>
                    <Button variant="outline" onClick={generateSampleXML}>
                      <FileText className="h-4 w-4 mr-2" />
                      Örnek XML
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Transfer Durumu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="transferId">Transfer ID</Label>
                      <Input
                        id="transferId"
                        value={transferId}
                        onChange={(e) => setTransferId(e.target.value)}
                        placeholder="Transfer ID'yi girin"
                      />
                                </div>
                    <Button onClick={handleCheckTransferStatus} disabled={loading}>
                      <Eye className="h-4 w-4 mr-2" />
                      Durumu Sorgula
                    </Button>
                    {transferStatus && (
                      <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                                <div className="flex items-center gap-2">
                          <Badge variant={transferStatus.stateCode === 5 ? "default" : "secondary"}>
                            Kod: {transferStatus.stateCode}
                          </Badge>
                          <span className="text-sm font-medium">{transferStatus.stateName}</span>
                                </div>
                        <p className="text-sm text-gray-600">{transferStatus.stateDescription}</p>
                              </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Fatura Durumu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="invoiceUUID">Fatura UUID</Label>
                      <Input
                        id="invoiceUUID"
                        value={invoiceUUID}
                        onChange={(e) => setInvoiceUUID(e.target.value)}
                        placeholder="Fatura UUID'sini girin"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCheckInvoiceStatus} disabled={loading}>
                        <Eye className="h-4 w-4 mr-2" />
                        Durumu Sorgula
                      </Button>
                      <Button variant="outline" onClick={handleDownloadInvoice} disabled={loading}>
                        <Download className="h-4 w-4 mr-2" />
                        İndir
                      </Button>
                                </div>
                    {invoiceStatus && (
                      <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                                <div className="flex items-center gap-2">
                          <Badge variant={invoiceStatus.stateCode === 5 ? "default" : "secondary"}>
                            Kod: {invoiceStatus.stateCode}
                          </Badge>
                          <span className="text-sm font-medium">{invoiceStatus.stateName}</span>
                                </div>
                              </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="incoming" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Gelen Faturalar
                    <Button onClick={handleGetIncomingInvoices} disabled={loading} size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Yenile
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {incomingInvoices.length > 0 ? (
                    <div className="space-y-4">
                      {incomingInvoices.map((invoice, index) => (
                        <div key={index} className="border p-4 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{invoice.invoiceNumber || `Fatura ${index + 1}`}</p>
                              <p className="text-sm text-gray-600">UUID: {invoice.invoiceUUID}</p>
                            </div>
                            <div className="flex gap-2">
                            <Button
                              size="sm"
                                variant="outline"
                              onClick={() => handleAnswerInvoice(invoice.invoiceUUID, 'ACCEPTED')}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                              Kabul Et
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAnswerInvoice(invoice.invoiceUUID, 'REJECTED')}
                            >
                                <AlertCircle className="h-4 w-4 mr-2" />
                              Reddet
                            </Button>
                            </div>
                          </div>
                        </div>
                  ))}
                </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">Gelen fatura bulunamadı</p>
                  )}

                  <Separator className="my-4" />

                  <div>
                    <Label htmlFor="answerNote">Cevap Notu</Label>
                <Textarea
                  id="answerNote"
                  value={answerNote}
                  onChange={(e) => setAnswerNote(e.target.value)}
                      placeholder="Fatura cevabı için not..."
                  rows={3}
                />
              </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customer" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Müşteri Etiket Bilgisi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
              <div>
                    <Label htmlFor="customerVkn">Müşteri VKN/TCKN</Label>
                    <Input
                      id="customerVkn"
                      value={customerVkn}
                      onChange={(e) => setCustomerVkn(e.target.value)}
                      placeholder="VKN veya TCKN girin"
                    />
                  </div>
                  <Button onClick={handleGetCustomerAliases} disabled={loading}>
                    <Users className="h-4 w-4 mr-2" />
                    Etiket Bilgisini Getir
                  </Button>

                  {customerAliases.length > 0 && (
                  <div className="space-y-2">
                      <h4 className="font-medium">Bulunan Etiketler:</h4>
                      {customerAliases.map((alias, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium">{alias.title}</p>
                          <p className="text-sm text-gray-600">Etiket: {alias.alias}</p>
                          <p className="text-sm text-gray-600">VKN: {alias.identifierNumber}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Test Fonksiyonları</CardTitle>
                  <CardDescription>
                    Veriban API'sini test etmek için hazır fonksiyonlar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={generateSampleXML} variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Örnek Fatura XML'i Oluştur
                    </Button>
                    <Button onClick={generateResponseXML} variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Fatura Cevap XML'i Oluştur
                    </Button>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Test Bilgileri</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Test Kullanıcısı: TESTER@VRBN</li>
                      <li>• Test Şifresi: Vtest*2020*</li>
                      <li>• Test VKN: 9240481875</li>
                      <li>• Test Portal: https://portaltest.veriban.com.tr</li>
                    </ul>
                </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Veriban Ayarları</CardTitle>
                  <CardDescription>
                    Veriban entegrasyon ayarlarını düzenlemek için ayarlar sayfasına gidin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => window.location.href = '/settings'}>
                    <Settings className="h-4 w-4 mr-2" />
                    Ayarlara Git
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}; 