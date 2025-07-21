import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Eye, 
  FileText, 
  Calendar, 
  DollarSign, 
  Building, 
  Loader2,
  Package,
  Search,
  RefreshCw,
  X,
  AlertCircle,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

// Fatura listesi için basit interface (fetch_incoming endpoint'inden gelen)
interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  supplierTaxNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  taxAmount: number;
  status: string;
  pdfUrl: string | null;
  xmlData: any; // Ham Nilvera response'u
}

// Fatura detayı için detaylı interface (get_invoice_details endpoint'inden gelen)
interface InvoiceDetails {
  invoiceInfo: {
    number: string;
    date: string;
    totalAmount: number;
    currency: string;
    taxTotalAmount: number;
    lineExtensionAmount: number;
  };
  supplier: {
    name: string;
    taxNumber: string;
    address: string;
  };
  items: Array<{
    description: string;
    productCode: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    vatRate: number;
    vatAmount: number;
    totalAmount: number;
    discountRate: number;
    discountAmount: number;
  }>;
}

// XML'den parse edilen fatura kalemi interface'i
interface InvoiceLineItem {
  lineNumber: string;
  itemName: string;
  itemCode: string;
  quantity: number;
  unit: string;
  unitCode: string;
  lineExtensionAmount: number;
}

// Stok ürünü interface'i
interface StockProduct {
  id: string;
  name: string;
  stock_quantity: number;
}

export default function InvoiceManagementTab() {
  // Fatura listesi state'leri
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedTab, setSelectedTab] = useState('gelen');
  
  // Detay modal state'leri
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceSummary | null>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  
  // XML Detay modal state'leri
  const [isXmlDetailsOpen, setIsXmlDetailsOpen] = useState(false);
  const [xmlLineItems, setXmlLineItems] = useState<InvoiceLineItem[]>([]);
  const [isXmlLoading, setIsXmlLoading] = useState(false);
  const [stockProducts, setStockProducts] = useState<StockProduct[]>([]);
  const [lineItemSelections, setLineItemSelections] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  // Otomatik yenileme için useEffect
  useEffect(() => {
    loadInvoicesList();
    loadStockProducts();
    
    // Her 30 saniyede bir otomatik yenile
    const interval = setInterval(() => {
      loadInvoicesList();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filtreleme için useEffect
  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, dateRange, selectedTab]);

  // Filtreleme fonksiyonu
  const filterInvoices = () => {
    let filtered = [...invoices];

    // Arama terimi ile filtrele
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.supplierTaxNumber.includes(searchTerm)
      );
    }

    // Tarih aralığı ile filtrele
    if (dateRange.from) {
      filtered = filtered.filter(invoice => 
        new Date(invoice.invoiceDate) >= new Date(dateRange.from)
      );
    }
    if (dateRange.to) {
      filtered = filtered.filter(invoice => 
        new Date(invoice.invoiceDate) <= new Date(dateRange.to)
      );
    }

    setFilteredInvoices(filtered);
  };

  // 1️⃣ FATURA LİSTESİ YÜKLEME (fetch_incoming endpoint)
  // Bu endpoint sadece özet bilgileri getirir: fatura no, tedarikçi, tutar, tarih vs.
  const loadInvoicesList = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Fatura listesi yükleniyor... (fetch_incoming)');
      
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { action: 'fetch_incoming' }
      });

      console.log('📥 Lista API Response:', data);

      if (data && data.success) {
        setInvoices(data.invoices || []);
        console.log('🎯 Yüklenen fatura sayısı:', data.invoices?.length || 0);
        toast({
          title: "✅ Liste Yüklendi",
          description: `${data.invoices?.length || 0} fatura listelendi`
        });
      } else {
        console.error('❌ Lista API Error:', data);
        throw new Error(data?.message || data?.error || 'Fatura listesi yüklenemedi');
      }
    } catch (error: any) {
      console.error('❌ Load invoices list error:', error);
      toast({
        title: "❌ Liste Hatası",
        description: error.message || "Fatura listesi yüklenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 2️⃣ FATURA DETAYI YÜKLEME (get_invoice_details endpoint)
  // Bu endpoint XML parsing yaparak detaylı bilgileri getirir: ürün kalemleri, tam detaylar vs.
  const loadInvoiceDetails = async (invoice: InvoiceSummary) => {
    try {
      setSelectedInvoice(invoice);
      setIsDetailsLoading(true);
      setIsDetailsOpen(true);
      setInvoiceDetails(null); // Önceki detayları temizle
      
      console.log('📄 Fatura detayları yükleniyor... (get_invoice_details)', invoice.id);
      
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { 
          action: 'get_invoice_details',
          invoice: { invoiceId: invoice.id }
        }
      });

      console.log('📥 Detay API Response:', data);

      if (data && data.success && data.invoiceDetails) {
        setInvoiceDetails(data.invoiceDetails);
        console.log('🎯 Detay yüklendi:', data.invoiceDetails.items?.length || 0, 'kalem');
        toast({
          title: "✅ Detay Yüklendi",
          description: `${data.invoiceDetails.items?.length || 0} kalem detayı yüklendi`
        });
      } else {
        console.error('❌ Detay API Error:', data);
        throw new Error(data?.message || 'Fatura detayları alınamadı');
      }
    } catch (error: any) {
      console.error('❌ Invoice details error:', error);
      toast({
        title: "❌ Detay Hatası",
        description: error.message || "Fatura detayları yüklenirken hata oluştu",
        variant: "destructive",
      });
      setIsDetailsOpen(false);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  // Faturalardan ürünleri parse et ve eşleştirme sayfasına yönlendir
  const processInvoiceForMapping = async (invoice: InvoiceSummary) => {
    // Fatura verilerini session storage'a kaydet
    sessionStorage.setItem(`invoice_${invoice.id}`, JSON.stringify(invoice));
    
    // Yeni sayfaya yönlendir
    window.location.href = `/product-mapping/${invoice.id}`;
  };

  // Dikkat alma fonksiyonu
  const handleDikkateAlma = async (invoice: InvoiceSummary) => {
    toast({
      title: "Dikkat Alma",
      description: "Bu fatura dikkate alınmayanlara eklendi"
    });
  };

  // Stok ürünlerini yükle
  const loadStockProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .order('name');
      
      if (error) throw error;
      setStockProducts(data || []);
    } catch (error: any) {
      console.error('Stok ürünleri yüklenirken hata:', error);
      toast({
        title: "Hata",
        description: "Stok ürünleri yüklenirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  // XML detaylarını yükle ve parse et
  const loadXmlDetails = async (invoice: InvoiceSummary) => {
    try {
      setSelectedInvoice(invoice);
      setIsXmlLoading(true);
      setIsXmlDetailsOpen(true);
      setXmlLineItems([]);
      setLineItemSelections({});
      
      console.log('🔍 XML detayları yükleniyor:', invoice.id);
      
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { 
          action: 'get_xml_details',
          invoiceId: invoice.id
        }
      });

      console.log('📥 XML API Response:', data);

      if (data && data.success && data.lineItems) {
        setXmlLineItems(data.lineItems);
        console.log('🎯 XML kalemler yüklendi:', data.lineItems.length);
        toast({
          title: "✅ XML Detayları Yüklendi",
          description: `${data.lineItems.length} kalem bulundu`
        });
      } else {
        console.error('❌ XML API Error:', data);
        throw new Error(data?.message || 'XML detayları alınamadı');
      }
    } catch (error: any) {
      console.error('❌ XML details error:', error);
      toast({
        title: "❌ XML Hatası",
        description: error.message || "XML detayları yüklenirken hata oluştu",
        variant: "destructive",
      });
      setIsXmlDetailsOpen(false);
    } finally {
      setIsXmlLoading(false);
    }
  };

  // Satır için stok seçimi
  const handleStockSelection = (lineNumber: string, stockId: string) => {
    setLineItemSelections(prev => ({
      ...prev,
      [lineNumber]: stockId
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SİZE GELEN E-FATURALAR ve E-İRSALİYELER</h1>
            <p className="text-sm text-gray-500 mt-1">
              Fatura listesi otomatik yenilenir. Detaylar için "Detaylar" butonuna tıklayın.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              📧 E-Fatura Ayarları
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              🛒 Kontör Satın Al
            </Button>
          </div>
        </div>

        {/* Tarih Aralığı Filtresi */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-sm font-medium">Tarih Aralığı</span>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-40"
            />
            <span>-</span>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-40"
            />
            <Button 
              onClick={loadInvoicesList}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Listele"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border">
        <div className="flex border-b">
          <button
            onClick={() => setSelectedTab('gelen')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'gelen' 
                ? 'border-green-500 text-green-700 bg-green-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📧 GELEN E-FATURALAR
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {invoices.filter(inv => inv.status !== 'rejected').length}
            </Badge>
          </button>
          
          <button
            onClick={() => setSelectedTab('giden')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'giden' 
                ? 'border-blue-500 text-blue-700 bg-blue-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📤 GELEN E-İRSALİYELER
          </button>
          
          <button
            onClick={() => setSelectedTab('dikkate-alinmayanlar')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'dikkate-alinmayanlar' 
                ? 'border-red-500 text-red-700 bg-red-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            ❌ DİKKATE ALINMAYANLAR
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              3
            </Badge>
          </button>
          
          <button
            onClick={() => setSelectedTab('reddedilenler')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'reddedilenler' 
                ? 'border-red-500 text-red-700 bg-red-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            ❌ REDDEDİLENLER
          </button>
        </div>

        {/* Fatura Listesi */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Fatura listesi yükleniyor...</span>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Fatura Bulunamadı</h3>
              <p className="text-gray-500">
                Seçilen kriterlere uygun fatura bulunamadı.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-gray-50">
                  {/* Fatura Header - Sadece Özet Bilgiler */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="text-sm text-gray-600">Gönderen</div>
                        <div className="text-sm text-gray-600">Vergi No</div>
                        <div className="text-sm text-gray-600">Tarih</div>
                        <div className="text-sm text-gray-600">Fatura No</div>
                        <div className="text-sm text-gray-600">Tutar</div>
                        <Badge className="bg-orange-100 text-orange-700">TEMEL</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="font-semibold text-green-600 min-w-[200px]">
                          {invoice.supplierName}
                        </div>
                        <div className="text-green-600 min-w-[120px]">
                          {invoice.supplierTaxNumber}
                        </div>
                        <div className="text-green-600 min-w-[100px]">
                          {format(new Date(invoice.invoiceDate), 'dd.MM.yyyy', { locale: tr })} 00:00
                        </div>
                        <div className="text-green-600 min-w-[150px]">
                          {invoice.invoiceNumber}
                        </div>
                        <div className="text-green-600 font-semibold">
                          {invoice.totalAmount.toLocaleString('tr-TR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} TL
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDikkateAlma(invoice)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      ❌ Dikkate Alma
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadInvoiceDetails(invoice)}
                      className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                    >
                      📄 Detaylar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadXmlDetails(invoice)}
                      className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                    >
                      📋 Detayları Gör
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => processInvoiceForMapping(invoice)}
                      className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    >
                      ✅ Ürün Eşleştir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fatura Detayları Modal - XML Parse Edilmiş Tam Detaylar */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Fatura Detayları - {selectedInvoice?.invoiceNumber}
              <Badge variant="secondary" className="ml-2">XML Parse Edildi</Badge>
            </DialogTitle>
          </DialogHeader>
          
          {isDetailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2">XML parse ediliyor ve detaylar yükleniyor...</span>
            </div>
          ) : invoiceDetails ? (
            <div className="space-y-6">
              {/* Fatura Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fatura Bilgileri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fatura No</label>
                      <p className="text-lg font-semibold">{invoiceDetails.invoiceInfo.number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tarih</label>
                      <p className="text-lg">{invoiceDetails.invoiceInfo.date}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Toplam Tutar</label>
                      <p className="text-lg font-semibold text-green-600">
                        {invoiceDetails.invoiceInfo.totalAmount.toLocaleString('tr-TR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} {invoiceDetails.invoiceInfo.currency}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">KDV Tutarı</label>
                      <p className="text-lg font-semibold">
                        {invoiceDetails.invoiceInfo.taxTotalAmount.toLocaleString('tr-TR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} {invoiceDetails.invoiceInfo.currency}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tedarikçi Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tedarikçi Bilgileri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Firma Adı</label>
                      <p className="text-lg">{invoiceDetails.supplier.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Vergi No</label>
                      <p className="text-lg">{invoiceDetails.supplier.taxNumber}</p>
                    </div>
                    {invoiceDetails.supplier.address && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">Adres</label>
                        <p className="text-lg">{invoiceDetails.supplier.address}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Ürün/Hizmet Kalemleri - XML'den Parse Edilmiş */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Ürün/Hizmet Kalemleri 
                    <Badge variant="secondary" className="ml-2">
                      {invoiceDetails.items.length} Kalem
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left">Açıklama</th>
                          <th className="border border-gray-200 px-4 py-2 text-center">Miktar</th>
                          <th className="border border-gray-200 px-4 py-2 text-center">Birim</th>
                          <th className="border border-gray-200 px-4 py-2 text-right">Birim Fiyat</th>
                          <th className="border border-gray-200 px-4 py-2 text-center">KDV %</th>
                          <th className="border border-gray-200 px-4 py-2 text-right">Tutar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceDetails.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-2">{item.description}</td>
                            <td className="border border-gray-200 px-4 py-2 text-center">{item.quantity}</td>
                            <td className="border border-gray-200 px-4 py-2 text-center">{item.unit}</td>
                            <td className="border border-gray-200 px-4 py-2 text-right">
                              {item.unitPrice.toLocaleString('tr-TR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-center">{item.vatRate}%</td>
                            <td className="border border-gray-200 px-4 py-2 text-right font-semibold">
                              {item.totalAmount.toLocaleString('tr-TR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-500">Fatura detayları yüklenemedi.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* XML Fatura Detayları Modal - Kalem Bazında Eşleştirme */}
      <Dialog open={isXmlDetailsOpen} onOpenChange={setIsXmlDetailsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Fatura Kalemleri - {selectedInvoice?.invoiceNumber}
              <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">XML Parse</Badge>
            </DialogTitle>
          </DialogHeader>
          
          {isXmlLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <span className="ml-2">XML parse ediliyor ve kalemler yükleniyor...</span>
            </div>
          ) : xmlLineItems.length > 0 ? (
            <div className="space-y-6">
              {/* Fatura Bilgi Özeti */}
              <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fatura No</label>
                      <p className="text-lg font-semibold text-purple-700">{selectedInvoice?.invoiceNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Tedarikçi</label>
                      <p className="text-lg font-semibold text-purple-700">{selectedInvoice?.supplierName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Toplam Tutar</label>
                      <p className="text-lg font-semibold text-purple-700">
                        {selectedInvoice?.totalAmount.toLocaleString('tr-TR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} {selectedInvoice?.currency}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Kalem Listesi Tablosu */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-purple-700">
                    Fatura Kalemleri ({xmlLineItems.length} adet)
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Her kalem için stok ürününüzü seçebilirsiniz. Seçimler sadece bu sayfada gösterilir, kayıt edilmez.
                  </p>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-purple-50">
                        <TableHead className="font-semibold text-purple-700">Satır No</TableHead>
                        <TableHead className="font-semibold text-purple-700">Mal/Hizmet Adı</TableHead>
                        <TableHead className="font-semibold text-purple-700">Mal/Hizmet Kodu</TableHead>
                        <TableHead className="font-semibold text-purple-700">Miktar</TableHead>
                        <TableHead className="font-semibold text-purple-700">Birim</TableHead>
                        <TableHead className="font-semibold text-purple-700">Tutar</TableHead>
                        <TableHead className="font-semibold text-purple-700">Stoktan Eşleştir</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {xmlLineItems.map((item, index) => (
                        <TableRow key={index} className="hover:bg-purple-50/50">
                          <TableCell className="font-medium">{item.lineNumber}</TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="font-medium text-gray-900">{item.itemName}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {item.itemCode || '-'}
                            </code>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {item.quantity.toLocaleString('tr-TR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-gray-50">
                              {item.unit} ({item.unitCode})
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {item.lineExtensionAmount.toLocaleString('tr-TR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })} TL
                          </TableCell>
                          <TableCell>
                            <Select
                              value={lineItemSelections[item.lineNumber] || ""}
                              onValueChange={(value) => handleStockSelection(item.lineNumber, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Stok Seçin" />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                <SelectItem value="">Seçim Yap</SelectItem>
                                {stockProducts.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{product.name}</span>
                                      <span className="text-xs text-gray-500">
                                        Stok: {product.stock_quantity}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {lineItemSelections[item.lineNumber] && (
                              <div className="mt-1">
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  ✅ Eşleştirildi
                                </Badge>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Eşleştirme Özeti */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-700 mb-1">Eşleştirme Durumu</h3>
                      <p className="text-sm text-green-600">
                        {Object.keys(lineItemSelections).length} / {xmlLineItems.length} kalem eşleştirildi
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-700">
                        {Math.round((Object.keys(lineItemSelections).length / xmlLineItems.length) * 100)}%
                      </div>
                      <p className="text-xs text-green-600">Tamamlandı</p>
                    </div>
                  </div>
                  
                  {Object.keys(lineItemSelections).length === xmlLineItems.length && (
                    <div className="mt-4 p-3 bg-green-100 rounded-lg">
                      <p className="text-green-700 font-medium text-center">
                        🎉 Tüm kalemler eşleştirildi! Bu seçimler sadece bu sayfada gösterilmektedir.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Kalem Bulunamadı</h3>
              <p className="text-gray-500">
                Bu faturada XML parse edilebilir kalem bulunamadı.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}