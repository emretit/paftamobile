import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  FileText, 
  Download, 
  Eye, 
  RefreshCw,
  Search,
  Calendar,
  Building,
  CreditCard,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import DefaultLayout from '../components/layouts/DefaultLayout';

interface VeribanInvoice {
  id: number;
  invoice_uuid: string;
  invoice_number: string;
  issue_time: string | null;
  customer_register_number: string | null;
  customer_title: string | null;
  invoice_profile: string | null;
  invoice_type: string | null;
  line_extension_amount: number;
  allowance_total_amount: number;
  tax_exclusive_amount: number;
  tax_total_amount: number;
  payable_amount: number;
  currency_code: string;
  exchange_rate: number;
  is_read: boolean;
  is_transferred: boolean;
  is_answered: boolean;
  answer_type: string | null;
  created_at: string;
  updated_at: string;
}

interface VeribanInvoiceLineItem {
  id: number;
  line_number: number;
  item_name: string;
  item_description: string | null;
  quantity: number;
  unit_code: string;
  unit_price: number;
  line_total: number;
  tax_rate: number;
  tax_amount: number;
}

const VeribanInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<VeribanInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<VeribanInvoice | null>(null);
  const [lineItems, setLineItems] = useState<VeribanInvoiceLineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const loadInvoices = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('veriban_incoming_invoices')
        .select('*')
        .order('created_at', { ascending: false });

      // Tarih filtresi
      if (dateFilter.startDate) {
        query = query.gte('issue_time', dateFilter.startDate);
      }
      if (dateFilter.endDate) {
        query = query.lte('issue_time', dateFilter.endDate + 'T23:59:59');
      }

      // Arama filtresi
      if (searchTerm) {
        query = query.or(`invoice_number.ilike.%${searchTerm}%,customer_title.ilike.%${searchTerm}%,customer_register_number.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading invoices:', error);
      } else {
        setInvoices(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLineItems = async (invoiceId: number) => {
    try {
      const { data, error } = await supabase
        .from('veriban_invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('line_number');

      if (error) {
        console.error('Error loading line items:', error);
      } else {
        setLineItems(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInvoiceSelect = async (invoice: VeribanInvoice) => {
    setSelectedInvoice(invoice);
    await loadLineItems(invoice.id);
  };

  const markAsTransferred = async (invoiceId: number) => {
    try {
      const { error } = await supabase
        .from('veriban_incoming_invoices')
        .update({ is_transferred: true, updated_at: new Date().toISOString() })
        .eq('id', invoiceId);

      if (error) {
        console.error('Error marking as transferred:', error);
      } else {
        loadInvoices(); // Listeyi yenile
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.payable_amount, 0);
  const unreadCount = invoices.filter(invoice => !invoice.is_read).length;
  const untransferredCount = invoices.filter(invoice => !invoice.is_transferred).length;

  return (
    <DefaultLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Veriban Gelen Faturalar</h1>
            <p className="text-gray-600">Supabase'de saklanan gelen e-faturalar</p>
          </div>
          <Button onClick={loadInvoices} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Fatura</p>
                  <p className="text-2xl font-bold">{invoices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Tutar</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Okunmamış</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Download className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Transfer Edilmemiş</p>
                  <p className="text-2xl font-bold">{untransferredCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtreler */}
        <Card>
          <CardHeader>
            <CardTitle>Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Arama</Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Fatura no, firma adı veya VKN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Bitiş Tarihi</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={loadInvoices} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Filtrele
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fatura Listesi */}
          <Card>
            <CardHeader>
              <CardTitle>Fatura Listesi</CardTitle>
              <CardDescription>
                {invoices.length} fatura bulundu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedInvoice?.id === invoice.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleInvoiceSelect(invoice)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{invoice.invoice_number}</span>
                          {!invoice.is_read && (
                            <Badge variant="secondary" className="text-xs">Yeni</Badge>
                          )}
                          {!invoice.is_transferred && (
                            <Badge variant="outline" className="text-xs">Transfer Edilmemiş</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{invoice.customer_title}</p>
                        <p className="text-sm text-gray-500">VKN: {invoice.customer_register_number}</p>
                        <p className="text-sm text-gray-500">{formatDate(invoice.issue_time)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(invoice.payable_amount, invoice.currency_code)}</p>
                        <p className="text-xs text-gray-500">{invoice.invoice_profile}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fatura Detayı */}
          <Card>
            <CardHeader>
              <CardTitle>Fatura Detayı</CardTitle>
              {selectedInvoice && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => markAsTransferred(selectedInvoice.id)}
                    disabled={selectedInvoice.is_transferred}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {selectedInvoice.is_transferred ? 'Transfer Edildi' : 'Transfer Edildi İşaretle'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {selectedInvoice ? (
                <div className="space-y-4">
                  {/* Temel Bilgiler */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Fatura No:</strong> {selectedInvoice.invoice_number}
                    </div>
                    <div>
                      <strong>UUID:</strong> {selectedInvoice.invoice_uuid.substring(0, 8)}...
                    </div>
                    <div>
                      <strong>Tarih:</strong> {formatDate(selectedInvoice.issue_time)}
                    </div>
                    <div>
                      <strong>Profil:</strong> {selectedInvoice.invoice_profile}
                    </div>
                    <div>
                      <strong>Tip:</strong> {selectedInvoice.invoice_type}
                    </div>
                    <div>
                      <strong>Para Birimi:</strong> {selectedInvoice.currency_code}
                    </div>
                  </div>

                  {/* Firma Bilgileri */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Gönderen Firma</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Ünvan:</strong> {selectedInvoice.customer_title}</p>
                      <p><strong>VKN/TCKN:</strong> {selectedInvoice.customer_register_number}</p>
                    </div>
                  </div>

                  {/* Tutar Bilgileri */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Tutar Bilgileri</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Mal/Hizmet Toplamı:</span>
                        <span>{formatCurrency(selectedInvoice.line_extension_amount, selectedInvoice.currency_code)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>İskonto:</span>
                        <span>{formatCurrency(selectedInvoice.allowance_total_amount, selectedInvoice.currency_code)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vergiler Hariç:</span>
                        <span>{formatCurrency(selectedInvoice.tax_exclusive_amount, selectedInvoice.currency_code)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>KDV Toplamı:</span>
                        <span>{formatCurrency(selectedInvoice.tax_total_amount, selectedInvoice.currency_code)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Ödenecek Tutar:</span>
                        <span>{formatCurrency(selectedInvoice.payable_amount, selectedInvoice.currency_code)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fatura Kalemleri */}
                  {lineItems.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Fatura Kalemleri ({lineItems.length})</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {lineItems.map((item) => (
                          <div key={item.id} className="text-sm border rounded p-2">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium">{item.item_name}</p>
                                {item.item_description && (
                                  <p className="text-gray-600 text-xs">{item.item_description}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                  {item.quantity} {item.unit_code} × {formatCurrency(item.unit_price, selectedInvoice.currency_code)}
                                  {item.tax_rate > 0 && ` (KDV: %${item.tax_rate})`}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(item.line_total, selectedInvoice.currency_code)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Detayları görmek için bir fatura seçin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default VeribanInvoices; 