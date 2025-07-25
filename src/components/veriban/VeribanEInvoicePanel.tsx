import React, { useState, useEffect } from 'react';
import { useVeribanEInvoice } from '../../hooks/useVeribanEInvoice';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Upload, 
  Download, 
  Send, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  FileText,
  AlertCircle,
  Eye,
  Clock,
  CheckSquare,
  XSquare,
  DollarSign,
  Calendar,
  User,
  Building
} from 'lucide-react';

export const VeribanEInvoicePanel: React.FC = () => {
  const {
    loading,
    error,
    login,
    sendInvoice,
    getTransferStatus,
    getIncomingInvoices,
    answerInvoice,
    downloadInvoice,
    logout,
    clearError
  } = useVeribanEInvoice();

  const [xmlContent, setXmlContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [customerAlias, setCustomerAlias] = useState('');
  const [transferId, setTransferId] = useState('');
  const [invoiceUUID, setInvoiceUUID] = useState('');
  const [transferStatus, setTransferStatus] = useState<any>(null);
  const [incomingInvoices, setIncomingInvoices] = useState<any[]>([]);
  const [answerNote, setAnswerNote] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Sayfa yüklendiğinde otomatik giriş yap ve gelen faturaları getir
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

  const handleGetIncomingInvoices = async () => {
    const invoices = await getIncomingInvoices();
    setIncomingInvoices(invoices);
  };

  const handleAnswerInvoice = async (uuid: string, answerType: 'ACCEPTED' | 'REJECTED') => {
    const result = await answerInvoice(uuid, answerType, answerNote);
    if (result?.operationCompleted) {
      alert('Cevap başarıyla gönderildi!');
      handleGetIncomingInvoices(); // Listeyi yenile
    }
  };

  const handleDownloadInvoice = async (uuid: string) => {
    const result = await downloadInvoice(uuid);
    if (result?.downloadFileReady && result.downloadFile) {
      // Dosyayı indir
      const blob = new Blob([result.downloadFile.fileData], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.downloadFile.fileNameWithExtension;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getStatusBadge = (stateCode: number) => {
    switch (stateCode) {
      case 1: return <Badge variant="secondary">Bilinmiyor</Badge>;
      case 2: return <Badge variant="outline">Bekliyor</Badge>;
      case 3: return <Badge variant="default">İşleniyor</Badge>;
      case 4: return <Badge variant="destructive">Hatalı</Badge>;
      case 5: return <Badge variant="default" className="bg-green-500">Başarılı</Badge>;
      default: return <Badge variant="secondary">Bilinmiyor</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

          <Tabs defaultValue="incoming" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="incoming" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Gelen Faturalar ({incomingInvoices.length})
              </TabsTrigger>
              <TabsTrigger value="send" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Fatura Gönder
              </TabsTrigger>
              <TabsTrigger value="status" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Durum Sorgula
              </TabsTrigger>
            </TabsList>

            {/* Gelen Faturalar Sekmesi */}
            <TabsContent value="incoming" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Gelen E-Faturalar</h3>
                  <p className="text-sm text-gray-600">
                    İşlenmemiş gelen faturalarınızı görüntüleyin ve yönetin
                  </p>
                </div>
                <Button onClick={handleGetIncomingInvoices} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Listeyi Yenile
                </Button>
              </div>

              {incomingInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Gelen Fatura Yok</h3>
                  <p className="text-gray-600">Şu anda işlenmemiş gelen e-faturanız bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingInvoices.map((invoice, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{invoice.customerTitle}</span>
                                <Badge variant="outline" className="text-xs">
                                  {invoice.customerRegisterNumber}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium">Fatura No:</span>
                                  <span className="text-sm">{invoice.invoiceNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium">Tarih:</span>
                                  <span className="text-sm">{formatDate(invoice.issueTime)}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium">Tutar:</span>
                                  <span className="text-sm font-semibold">
                                    {formatCurrency(invoice.payableAmount, invoice.currencyCode)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium">Senaryo:</span>
                                  <span className="text-sm">{invoice.invoiceProfile}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium">Tip:</span>
                                  <span className="text-sm">{invoice.invoiceType}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckSquare className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium">Görüntülendi:</span>
                                  <span className="text-sm">{invoice.isRead ? 'Evet' : 'Hayır'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => handleAnswerInvoice(invoice.invoiceUUID, 'ACCEPTED')}
                              disabled={loading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Kabul Et
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAnswerInvoice(invoice.invoiceUUID, 'REJECTED')}
                              disabled={loading}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reddet
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadInvoice(invoice.invoiceUUID)}
                              disabled={loading}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              İndir
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Cevap Notu */}
              <div className="space-y-2">
                <Label htmlFor="answerNote">Cevap Notu (Opsiyonel)</Label>
                <Textarea
                  id="answerNote"
                  value={answerNote}
                  onChange={(e) => setAnswerNote(e.target.value)}
                  placeholder="Cevap notu..."
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Fatura Gönder Sekmesi */}
            <TabsContent value="send" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">E-Fatura Gönderimi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fileName">Dosya Adı</Label>
                    <Input
                      id="fileName"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="fatura_ornek"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerAlias">Müşteri Etiketi (Opsiyonel)</Label>
                    <Input
                      id="customerAlias"
                      value={customerAlias}
                      onChange={(e) => setCustomerAlias(e.target.value)}
                      placeholder="urn:mail:defaultpk@veriban.com.tr"
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="xmlContent">XML İçeriği</Label>
                  <Textarea
                    id="xmlContent"
                    value={xmlContent}
                    onChange={(e) => setXmlContent(e.target.value)}
                    placeholder="UBL-TR formatında fatura XML'i..."
                    rows={10}
                  />
                </div>
                <Button onClick={handleSendInvoice} disabled={loading || !xmlContent || !fileName} className="mt-4">
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Fatura Gönder
                </Button>
              </div>
            </TabsContent>

            {/* Durum Sorgula Sekmesi */}
            <TabsContent value="status" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Transfer Durumu Sorgulama</h3>
                <div className="flex gap-2">
                  <Input
                    value={transferId}
                    onChange={(e) => setTransferId(e.target.value)}
                    placeholder="Transfer ID"
                  />
                  <Button onClick={handleCheckTransferStatus} disabled={loading || !transferId}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sorgula
                  </Button>
                </div>
                {transferStatus && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span>Durum:</span>
                      {getStatusBadge(transferStatus.stateCode)}
                    </div>
                    <p className="text-sm text-gray-600">{transferStatus.stateDescription}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}; 