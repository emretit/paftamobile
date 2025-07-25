import React, { useState } from 'react';
import { useVeribanEInvoice } from '../../hooks/useVeribanEInvoice';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  Upload, 
  Download, 
  Send, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  FileText,
  AlertCircle
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

  const handleLogin = async () => {
    const success = await login();
    if (success) {
      alert('Başarıyla giriş yapıldı!');
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

          {/* Login Section */}
          <div className="space-y-2">
            <Label>Bağlantı</Label>
            <div className="flex gap-2">
              <Button onClick={handleLogin} disabled={loading}>
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Giriş Yap
              </Button>
              <Button variant="outline" onClick={logout} disabled={loading}>
                Çıkış Yap
              </Button>
            </div>
          </div>

          {/* Send Invoice Section */}
          <div className="space-y-4">
            <Label>Fatura Gönderimi</Label>
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
            <div className="space-y-2">
              <Label htmlFor="xmlContent">XML İçeriği</Label>
              <Textarea
                id="xmlContent"
                value={xmlContent}
                onChange={(e) => setXmlContent(e.target.value)}
                placeholder="UBL-TR formatında fatura XML'i..."
                rows={10}
              />
            </div>
            <Button onClick={handleSendInvoice} disabled={loading || !xmlContent || !fileName}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Fatura Gönder
            </Button>
          </div>

          {/* Transfer Status Section */}
          <div className="space-y-4">
            <Label>Transfer Durumu Sorgulama</Label>
            <div className="flex gap-2">
              <Input
                value={transferId}
                onChange={(e) => setTransferId(e.target.value)}
                placeholder="Transfer ID"
              />
              <Button onClick={handleCheckTransferStatus} disabled={loading || !transferId}>
                <RefreshCw className="h-4 w-4" />
                Sorgula
              </Button>
            </div>
            {transferStatus && (
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span>Durum:</span>
                  {getStatusBadge(transferStatus.stateCode)}
                </div>
                <p className="text-sm text-gray-600">{transferStatus.stateDescription}</p>
              </div>
            )}
          </div>

          {/* Incoming Invoices Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Gelen Faturalar</Label>
              <Button onClick={handleGetIncomingInvoices} disabled={loading}>
                <RefreshCw className="h-4 w-4" />
                Listeyi Yenile
              </Button>
            </div>
            {incomingInvoices.length > 0 && (
              <div className="space-y-2">
                {incomingInvoices.map((invoice, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-600">{invoice.customerTitle}</p>
                        <p className="text-sm text-gray-600">{invoice.issueTime}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAnswerInvoice(invoice.invoiceUUID, 'ACCEPTED')}
                          disabled={loading}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Kabul Et
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAnswerInvoice(invoice.invoiceUUID, 'REJECTED')}
                          disabled={loading}
                        >
                          <XCircle className="h-4 w-4" />
                          Reddet
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadInvoice(invoice.invoiceUUID)}
                          disabled={loading}
                        >
                          <Download className="h-4 w-4" />
                          İndir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Answer Note Section */}
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
        </CardContent>
      </Card>
    </div>
  );
}; 