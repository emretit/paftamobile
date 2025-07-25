import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { useVeribanEInvoice } from '../../hooks/useVeribanEInvoice';
import { 
  FileText, 
  RefreshCw, 
  Download, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Building,
  CreditCard,
  Settings,
  Inbox,
  Send
} from 'lucide-react';

const VeribanIncomingInvoices: React.FC = () => {
  const {
    loading,
    error,
    login,
    getUnTransferredPurchaseInvoices,
    getPurchaseInvoiceDetailsFromUUIDs,
    getAllPurchaseInvoiceUUIDs,
    downloadPurchaseInvoice,
    markPurchaseInvoiceAsTransferred
  } = useVeribanEInvoice();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [purchaseInvoices, setPurchaseInvoices] = useState<any[]>([]);
  const [purchaseInvoiceUUIDs, setPurchaseInvoiceUUIDs] = useState<string[]>([]);
  const [selectedStartDate, setSelectedStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedEndDate, setSelectedEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Login işlemi
  const handleLogin = async () => {
    try {
      // Login fonksiyonu parametresiz çağrılıyor
      const result = await login();
      if (result) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Gelen fatura UUID'lerini getir
  const handleGetInvoiceUUIDs = async () => {
    try {
      // getAllPurchaseInvoiceUUIDs fonksiyonu için parametreler ekleniyor
      const result = await getAllPurchaseInvoiceUUIDs(new Date(selectedStartDate), new Date(selectedEndDate));
      if (result && Array.isArray(result)) {
        setPurchaseInvoiceUUIDs(result);
      }
    } catch (error) {
      console.error('Failed to get invoice UUIDs:', error);
    }
  };

  // Fatura detaylarını getir ve Supabase'e kaydet
  const handleGetInvoiceDetails = async () => {
    if (purchaseInvoiceUUIDs.length === 0) {
      alert('Önce UUID\'leri getirin!');
      return;
    }
    
    try {
      const result = await getPurchaseInvoiceDetailsFromUUIDs(purchaseInvoiceUUIDs);
      if (result && Array.isArray(result)) {
        setPurchaseInvoices(result);
      }
    } catch (error) {
      console.error('Failed to get invoice details:', error);
    }
  };

  // Transfer edilmemiş faturaları getir
  const handleGetUntransferredInvoices = async () => {
    try {
      const result = await getUnTransferredPurchaseInvoices();
      if (result && Array.isArray(result)) {
        setPurchaseInvoices(result);
      }
    } catch (error) {
      console.error('Failed to get untransferred invoices:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <div className="space-y-6">
      {/* Bağlantı Durumu */}
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
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={handleLogin} disabled={loading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Veriban'a Bağlan
            </Button>
            {isLoggedIn && (
              <Button onClick={handleGetInvoiceUUIDs} disabled={loading} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Fatura Listesini Çek
              </Button>
            )}
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Inbox className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Bulunan UUID</p>
                <p className="text-2xl font-bold">{purchaseInvoiceUUIDs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Detayı Çekilmiş</p>
                <p className="text-2xl font-bold">{purchaseInvoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Toplam Tutar</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    purchaseInvoices.reduce((sum, inv) => sum + (inv.payableAmount || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarih Filtreleri ve İşlemler */}
      <Card>
        <CardHeader>
          <CardTitle>Gelen Fatura İşlemleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleGetInvoiceDetails} 
              disabled={loading || purchaseInvoiceUUIDs.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Fatura Detaylarını Getir & Kaydet
            </Button>
            
            <Button 
              onClick={handleGetUntransferredInvoices} 
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Transfer Edilmemişleri Getir
            </Button>
            
            <Button 
              onClick={() => window.open('/veriban/invoices', '_blank')} 
              variant="secondary"
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Kayıtlı Faturaları Görüntüle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fatura Listesi */}
      {purchaseInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gelen Faturalar ({purchaseInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Durum</th>
                    <th className="text-left p-3 font-medium">Fatura No</th>
                    <th className="text-left p-3 font-medium">Tarih</th>
                    <th className="text-left p-3 font-medium">Gönderen</th>
                    <th className="text-left p-3 font-medium">Tutar</th>
                    <th className="text-left p-3 font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseInvoices.map((invoice, index) => (
                    <tr key={invoice.invoiceUUID || index} className="border-b hover:bg-muted/25">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {!invoice.isRead && (
                            <span className="w-2 h-2 bg-green-500 rounded-full" title="Yeni"></span>
                          )}
                          <Badge variant={invoice.isTransferred ? "default" : "secondary"}>
                            {invoice.isTransferred ? "Transfer Edildi" : "Bekliyor"}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{invoice.invoiceNumber || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">
                          {invoice.invoiceProfile || 'TEMELFATURA'}
                        </div>
                      </td>
                      <td className="p-3">
                        {formatDate(invoice.issueTime)}
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{invoice.customerTitle || 'Bilinmeyen'}</div>
                        <div className="text-xs text-muted-foreground">
                          VKN: {invoice.customerRegisterNumber || '-'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">
                          {formatCurrency(invoice.payableAmount || 0, invoice.currencyCode || 'TRY')}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => downloadPurchaseInvoice(invoice.invoiceUUID)}
                            disabled={loading}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          {!invoice.isTransferred && (
                            <Button 
                              size="sm" 
                              onClick={() => markPurchaseInvoiceAsTransferred(invoice.invoiceUUID)}
                              disabled={loading}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Yüklenme durumu */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>İşlem devam ediyor...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VeribanIncomingInvoices;