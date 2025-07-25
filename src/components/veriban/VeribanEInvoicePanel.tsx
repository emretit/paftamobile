// @ts-nocheck
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
  Users,
  Settings,
  Inbox,
  List,
  Calendar
} from 'lucide-react';

import { getTransferStateMessage, getInvoiceStateMessage, getAnswerTypeMessage, PurchaseInvoiceInfo, DownloadDocumentDataTypes } from '../../services/veriban/types';
import DefaultLayout from '../layouts/DefaultLayout';
// import { getVeribanConfig } from '../../config/veribanConfig';

interface VeribanEInvoicePanelProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export const VeribanEInvoicePanel: React.FC<VeribanEInvoicePanelProps> = ({ isCollapsed, setIsCollapsed }) => {
  const {
    loading,
    error,
    login,
    testLogin,
    sendInvoice,
    sendDocumentFile,
    getTransferStatus,
    getInvoiceStatus,
    getIncomingInvoices,
    answerInvoice,
    downloadInvoice,
    getCustomerAliasInfo,
    getUnTransferredPurchaseInvoices,
    getPurchaseInvoiceUUIDs,
    getAllPurchaseInvoiceUUIDs,
    getPurchaseInvoiceDetailsFromUUIDs,
    getUnTransferredPurchaseInvoiceUUIDs,
    downloadPurchaseInvoice,
    markPurchaseInvoiceAsTransferred,
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

  // Gelen e-faturalar için yeni state'ler
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoiceInfo[]>([]);
  const [purchaseInvoiceUUIDs, setPurchaseInvoiceUUIDs] = useState<string[]>([]);
  const [selectedStartDate, setSelectedStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedEndDate, setSelectedEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [downloadType, setDownloadType] = useState<DownloadDocumentDataTypes>(DownloadDocumentDataTypes.XML_INZIP);

  // Otomatik login ve UUID yükleme
  useEffect(() => {
    const attemptAutoLogin = async () => {
      // const config = getVeribanConfig();
      const config = null; // Temporarily disabled
      if (config && config.liveUserName && config.livePassword) {
        console.log('🔄 Otomatik giriş deneniyor...');
        // setLoading(true); // This state is not defined in the original file, so it's removed.
        try {
          const result = await login(config.liveUserName, config.livePassword);
          if (result.success) {
            setIsLoggedIn(true); // Changed from setLoginStatus to setIsLoggedIn
            // setMessage('✅ Otomatik giriş başarılı!'); // This state is not defined in the original file, so it's removed.
            
                         // Otomatik olarak UUID'leri yükle
             console.log('🔄 UUID\'ler otomatik yükleniyor...');
             const startDate = new Date(selectedStartDate);
             const endDate = new Date(selectedEndDate);
             const uuids = await getAllPurchaseInvoiceUUIDs(startDate, endDate);
             if (uuids) {
               setPurchaseInvoiceUUIDs(uuids);
               console.log(`✅ Otomatik olarak ${uuids.length} UUID yüklendi`);
             }
            
            // Transfer edilmemiş faturaları da yükle
            await handleGetUnTransferredPurchaseInvoices();
          } else {
            setIsLoggedIn(false); // Changed from setLoginStatus to setIsLoggedIn
            // setMessage(`❌ Otomatik giriş başarısız: ${result.error}`); // This state is not defined in the original file, so it's removed.
          }
        } catch (error) {
          setIsLoggedIn(false); // Changed from setLoginStatus to setIsLoggedIn
          // setMessage(`❌ Otomatik giriş hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`); // This state is not defined in the original file, so it's removed.
        } finally {
          // setLoading(false); // This state is not defined in the original file, so it's removed.
        }
      }
    };

    attemptAutoLogin();
  }, []);

  const handleLogin = async () => {
    const success = await login();
    if (success) {
      setIsLoggedIn(true);
      alert('Başarıyla giriş yapıldı!');
      await handleGetUnTransferredPurchaseInvoices();
    }
  };

  const handleTestLogin = async () => {
    const result = await testLogin();
    if (result.success) {
      setIsLoggedIn(true);
      alert(`✅ ${result.message}`);
      await handleGetUnTransferredPurchaseInvoices();
    } else {
      setIsLoggedIn(false);
      alert(`❌ ${result.message}`);
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



  // Gelen e-faturalar için handler metodları
  const handleGetUnTransferredPurchaseInvoices = async () => {
    const invoices = await getUnTransferredPurchaseInvoices();
    if (invoices) {
      setPurchaseInvoices(invoices);
    }
  };

  const handleGetPurchaseInvoiceUUIDs = async () => {
    const startDate = new Date(selectedStartDate);
    const endDate = new Date(selectedEndDate);
    const uuids = await getPurchaseInvoiceUUIDs(startDate, endDate);
    if (uuids) {
      setPurchaseInvoiceUUIDs(uuids);
    }
  };

  const handleGetAllPurchaseInvoiceUUIDs = async () => {
    const startDate = new Date(selectedStartDate);
    const endDate = new Date(selectedEndDate);
    const uuids = await getAllPurchaseInvoiceUUIDs(startDate, endDate);
    if (uuids) {
      setPurchaseInvoiceUUIDs(uuids);
    }
  };

  const handleGetPurchaseInvoiceDetails = async () => {
    if (purchaseInvoiceUUIDs.length === 0) {
      alert('Önce UUID listesi alın!');
      return;
    }
    
    console.log(`🔍 Getting details for ${purchaseInvoiceUUIDs.length} invoices...`);
    const invoices = await getPurchaseInvoiceDetailsFromUUIDs(purchaseInvoiceUUIDs);
    
    if (invoices.length > 0) {
      setPurchaseInvoices(invoices);
      console.log(`✅ Loaded ${invoices.length} invoice details`);
    } else {
      console.log('❌ No invoice details found');
    }
  };

  const handleGetUnTransferredPurchaseInvoiceUUIDs = async () => {
    const uuids = await getUnTransferredPurchaseInvoiceUUIDs();
    if (uuids) {
      setPurchaseInvoiceUUIDs(uuids);
    }
  };

  const handleDownloadPurchaseInvoice = async (uuid: string) => {
    const result = await downloadPurchaseInvoice(uuid, downloadType);
    if (result) {
      if (result.downloadFileReady) {
        alert(`Fatura indirmeye hazır: ${result.downloadDescription}`);
      } else {
        alert(`Fatura henüz hazır değil: ${result.downloadDescription}`);
      }
    }
  };

  const handleMarkPurchaseInvoiceAsTransferred = async (uuid: string) => {
    const result = await markPurchaseInvoiceAsTransferred(uuid);
    if (result && result.operationCompleted) {
      alert('Fatura başarıyla transfer edildi olarak işaretlendi!');
      // Listeyi yenile
      await handleGetUnTransferredPurchaseInvoices();
    } else {
      alert(`İşlem başarısız: ${result?.description || 'Bilinmeyen hata'}`);
    }
  };



  return (
    <DefaultLayout 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed}
      title="Veriban E-Fatura"
      subtitle="E-Fatura gönderimi, durum sorgulama ve gelen fatura yönetimi"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              E-Fatura Entegrasyonu
            </CardTitle>
            <CardDescription>
              Veriban API ile e-fatura işlemleri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>{error}</span>
                    {(error.includes('kullanıcı adı') || error.includes('şifre') || error.includes('ayarlar')) && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => window.location.href = '/settings'}
                        className="ml-2"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Ayarlara Git
                      </Button>
                    )}
                  </div>
                </AlertDescription>
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
                          <TabsList className="grid w-full grid-cols-5">
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
              {/* Login Durumu ve Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Veriban Bağlantı Durumu
                    </div>
                    <Badge variant={isLoggedIn ? "default" : "secondary"}>
                      {isLoggedIn ? "Bağlı" : "Bağlı Değil"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={handleTestLogin} disabled={loading} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Login Test Et
                    </Button>
                    <Button onClick={handleLogin} disabled={loading}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Giriş Yap
                    </Button>
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Gelen Faturalar Özeti */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Inbox className="h-5 w-5" />
                    Gelen Faturalar Özeti
                  </CardTitle>
                  <CardDescription>
                    Son 30 günde gelen e-faturaların durumu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-900">Transfer Edilmemiş</div>
                      <div className="text-2xl font-bold text-blue-600">{purchaseInvoices.length}</div>
                      <div className="text-xs text-blue-700">Fatura</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-900">Toplam UUID</div>
                      <div className="text-2xl font-bold text-green-600">{purchaseInvoiceUUIDs.length}</div>
                      <div className="text-xs text-green-700">Son 30 gün</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gelen Faturalar Tablosu - Veriban Benzeri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <List className="h-5 w-5" />
                      Gelen Faturalar
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleGetPurchaseInvoiceDetails} disabled={loading || purchaseInvoiceUUIDs.length === 0} size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Detayları Yükle & Kaydet
                      </Button>
                      <Button onClick={handleGetAllPurchaseInvoiceUUIDs} disabled={loading} size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        UUID'leri Yenile
                      </Button>
                      <Button 
                        onClick={() => window.open('/veriban/invoices', '_blank')} 
                        size="sm" 
                        variant="secondary"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Supabase'de Görüntüle
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Veriban formatında gelen e-faturalar listesi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Tarih Filtreleri */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={selectedStartDate}
                        onChange={(e) => setSelectedStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">Bitiş Tarihi</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={selectedEndDate}
                        onChange={(e) => setSelectedEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Veriban Benzeri Tablo */}
                  {purchaseInvoices.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="text-left p-3 font-medium">#</th>
                              <th className="text-left p-3 font-medium">Fatura Tarihi</th>
                              <th className="text-left p-3 font-medium">Zarf Tarihi</th>
                              <th className="text-left p-3 font-medium">Fatura Bilgileri</th>
                              <th className="text-left p-3 font-medium">Gönderen</th>
                              <th className="text-left p-3 font-medium">Tutar</th>
                              <th className="text-left p-3 font-medium">Durum</th>
                              <th className="text-left p-3 font-medium">İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {purchaseInvoices.map((invoice, index) => (
                              <tr key={invoice.invoiceUUID} className="border-b hover:bg-gray-50">
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded text-xs flex items-center justify-center">
                                      📄
                                    </span>
                                    {!invoice.isRead && (
                                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="text-sm">
                                    {invoice.issueTime ? 
                                      new Date(invoice.issueTime).toLocaleDateString('tr-TR') : 
                                      '-'
                                    }
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="text-sm">
                                    {invoice.issueTime ? 
                                      new Date(invoice.issueTime).toLocaleDateString('tr-TR') : 
                                      '-'
                                    }
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="space-y-1">
                                    <div className="font-medium text-blue-600">{invoice.invoiceNumber}</div>
                                    <div className="text-xs text-gray-500">
                                      Profil: {invoice.invoiceProfile || 'TEMELFATURA'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      FtrTip: {invoice.invoiceType || 'SATIS'}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="space-y-1">
                                    <div className="font-medium">{invoice.customerTitle || 'Bilinmeyen Firma'}</div>
                                    <div className="text-xs text-gray-500">
                                      VKN/TCKN: {invoice.customerRegisterNumber || '-'}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="space-y-1">
                                    <div className="text-xs">
                                      <span className="font-medium">VHT:</span> {invoice.taxExclusiveAmount.toFixed(2)} {invoice.currencyCode}
                                    </div>
                                    <div className="text-xs">
                                      <span className="font-medium">VRG:</span> {invoice.taxTotalAmount.toFixed(2)} {invoice.currencyCode}
                                    </div>
                                    <div className="text-sm font-medium">
                                      <span className="font-medium">TOP:</span> {invoice.payableAmount.toFixed(2)} {invoice.currencyCode}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="space-y-1">
                                    <Badge variant="outline" className="text-xs">
                                      Fatura: <span className="text-cyan-600">Başarıyla alıcıya iletildi</span>
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      Ftr.Cevap: <span className="text-blue-600">Cevap işlemi yapılmaz</span>
                                    </Badge>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="flex flex-col gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDownloadPurchaseInvoice(invoice.invoiceUUID)}
                                      disabled={loading}
                                      className="text-xs h-7"
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      Görüntüle
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDownloadPurchaseInvoice(invoice.invoiceUUID)}
                                      disabled={loading}
                                      className="text-xs h-7"
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      İndir
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleMarkPurchaseInvoiceAsTransferred(invoice.invoiceUUID)}
                                      disabled={loading}
                                      className="text-xs h-7 text-orange-600"
                                    >
                                      📋 İade Faturası
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Sayfalama */}
                      <div className="p-3 bg-gray-50 border-t flex items-center justify-between text-sm">
                        <div>
                          Toplam {purchaseInvoices.length} | Gösterilen 1 - {Math.min(10, purchaseInvoices.length)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" disabled>Önceki</Button>
                          <span className="px-2">1</span>
                          <Button size="sm" variant="outline" disabled>Sonraki</Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-12 border rounded-lg">
                      <Inbox className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <h3 className="text-lg font-medium mb-2">Henüz Fatura Detayı Yüklenmedi</h3>
                      <p className="text-sm mb-4">Gelen faturaların detaylarını görmek için:</p>
                      <div className="space-y-2">
                                                         <div className="text-xs text-gray-600">
                                   1. Giriş yaptıktan sonra UUID'ler otomatik yüklenir
                                 </div>
                        <div className="text-xs text-gray-600">
                          2. "Detayları Yükle & Kaydet" butonuna tıklayın
                        </div>
                      </div>
                      <div className="mt-6 space-x-2">
                                                       <Button 
                                 onClick={handleGetAllPurchaseInvoiceUUIDs}
                                 disabled={loading}
                                 size="sm"
                                 variant="outline"
                               >
                                 <RefreshCw className="h-4 w-4 mr-2" />
                                 UUID'leri Yenile
                               </Button>
                        <Button 
                          onClick={handleGetPurchaseInvoiceDetails}
                          disabled={loading || purchaseInvoiceUUIDs.length === 0}
                          size="sm"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Detayları Yükle
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* UUID Tablosu - Veriban Benzeri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5" />
                    Gelen Fatura UUID Listesi
                  </CardTitle>
                  <CardDescription>
                    Belirli tarih aralığında gelen e-faturaların UUID'leri ve temel bilgileri
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tarih Filtreleri */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="uuidStartDate">Başlangıç Tarihi</Label>
                      <Input
                        id="uuidStartDate"
                        type="date"
                        value={selectedStartDate}
                        onChange={(e) => setSelectedStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="uuidEndDate">Bitiş Tarihi</Label>
                      <Input
                        id="uuidEndDate"
                        type="date"
                        value={selectedEndDate}
                        onChange={(e) => setSelectedEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleGetPurchaseInvoiceUUIDs}
                      disabled={loading}
                      className="flex-1"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Tarih Aralığında Listele
                    </Button>
                    <Button 
                      onClick={handleGetAllPurchaseInvoiceUUIDs}
                      disabled={loading}
                      variant="outline"
                      className="flex-1"
                    >
                      <List className="h-4 w-4 mr-2" />
                      Tüm UUID'leri Listele
                    </Button>
                    <Button 
                      onClick={handleGetUnTransferredPurchaseInvoiceUUIDs}
                      disabled={loading}
                      variant="outline"
                      className="flex-1"
                    >
                      <List className="h-4 w-4 mr-2" />
                      Transfer Edilmemiş UUID'ler
                    </Button>
                  </div>

                  {purchaseInvoiceUUIDs.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                        <h4 className="font-medium">Bulunan UUID'ler ({purchaseInvoiceUUIDs.length})</h4>
                        <Button
                          onClick={handleGetPurchaseInvoiceDetails}
                          disabled={loading}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Detayları Al
                        </Button>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 border-b">
                            <tr>
                              <th className="text-left p-3 font-medium">#</th>
                              <th className="text-left p-3 font-medium">UUID</th>
                              <th className="text-left p-3 font-medium">Durum</th>
                              <th className="text-left p-3 font-medium">Tip</th>
                              <th className="text-left p-3 font-medium">İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {purchaseInvoiceUUIDs.map((uuid, index) => {
                              // Bu UUID'nin detay bilgisini bul
                              const invoiceDetail = purchaseInvoices.find(inv => inv.invoiceUUID === uuid);
                              
                              return (
                                <tr key={uuid} className="border-b hover:bg-gray-50">
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded text-xs flex items-center justify-center">
                                        {index + 1}
                                      </span>
                                      {invoiceDetail && !invoiceDetail.isRead && (
                                        <span className="w-2 h-2 bg-green-500 rounded-full" title="Yeni"></span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <div className="space-y-1">
                                      <div className="font-mono text-xs bg-gray-100 p-1 rounded">
                                        {uuid}
                                      </div>
                                      {invoiceDetail && (
                                        <div className="text-xs text-gray-600">
                                          <div className="font-medium text-blue-600">
                                            {invoiceDetail.invoiceNumber}
                                          </div>
                                          <div>
                                            {invoiceDetail.customerTitle || 'Bilinmeyen Firma'}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    {invoiceDetail ? (
                                      <div className="space-y-1">
                                        <Badge variant="outline" className="text-xs">
                                          <span className="text-green-600">Detay Yüklendi</span>
                                        </Badge>
                                        <div className="text-xs text-gray-500">
                                          {invoiceDetail.payableAmount.toFixed(2)} {invoiceDetail.currencyCode}
                                        </div>
                                      </div>
                                    ) : (
                                      <Badge variant="secondary" className="text-xs">
                                        Detay Bekleniyor
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    <div className="text-xs">
                                      {invoiceDetail ? (
                                        <div className="space-y-1">
                                          <div className="text-gray-600">
                                            Profil: {invoiceDetail.invoiceProfile || 'TEMELFATURA'}
                                          </div>
                                          <div className="text-gray-600">
                                            Tip: {invoiceDetail.invoiceType || 'SATIS'}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-gray-400">
                                          Detay yüklenmedi
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDownloadPurchaseInvoice(uuid)}
                                        disabled={loading}
                                        className="text-xs h-7"
                                        title="Faturayı İndir"
                                      >
                                        <Download className="h-3 w-3" />
                                      </Button>
                                      {invoiceDetail && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            // Fatura detayını göster
                                            alert(`Fatura: ${invoiceDetail.invoiceNumber}\nFirma: ${invoiceDetail.customerTitle}\nTutar: ${invoiceDetail.payableAmount} ${invoiceDetail.currencyCode}\nTarih: ${invoiceDetail.issueTime}`);
                                          }}
                                          disabled={loading}
                                          className="text-xs h-7"
                                          title="Detayları Göster"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* UUID Tablosu Alt Bilgi */}
                      <div className="p-3 bg-gray-50 border-t flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span>Toplam UUID: {purchaseInvoiceUUIDs.length}</span>
                          <span>Detayı Yüklenen: {purchaseInvoices.length}</span>
                          <span>Bekleyen: {purchaseInvoiceUUIDs.length - purchaseInvoices.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select 
                            value={downloadType}
                            onChange={(e) => setDownloadType(e.target.value as DownloadDocumentDataTypes)}
                            className="text-xs p-1 border rounded"
                          >
                            <option value={DownloadDocumentDataTypes.XML_INZIP}>XML (ZIP)</option>
                            <option value={DownloadDocumentDataTypes.HTML_INZIP}>HTML (ZIP)</option>
                            <option value={DownloadDocumentDataTypes.PDF_INZIP}>PDF (ZIP)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8 border rounded-lg">
                      <List className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <h3 className="font-medium mb-2">UUID Listesi Boş</h3>
                      <p className="text-sm mb-4">Gelen faturaların UUID'lerini görmek için yukarıdaki butonları kullanın</p>
                      <div className="space-y-2">
                        <Button 
                          onClick={handleGetAllPurchaseInvoiceUUIDs}
                          disabled={loading}
                          size="sm"
                          variant="outline"
                        >
                          <List className="h-4 w-4 mr-2" />
                          Tüm UUID'leri Listele
                        </Button>
                      </div>
                    </div>
                  )}
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
    </DefaultLayout>
  );
}; 