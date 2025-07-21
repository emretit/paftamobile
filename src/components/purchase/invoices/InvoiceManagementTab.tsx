import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
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
  xmlData: any;
}

export default function InvoiceManagementTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedTab, setSelectedTab] = useState('gelen'); // gelen, giden, dikkate-alinmayanlar, reddedilenler
  const { toast } = useToast();

  // Otomatik yenileme için useEffect
  useEffect(() => {
    loadInvoices();
    
    // Her 30 saniyede bir otomatik yenile
    const interval = setInterval(() => {
      loadInvoices();
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

  // Faturalardan ürünleri parse et ve eşleştirme sayfasına yönlendir
  const processInvoiceForMapping = async (invoice: Invoice) => {
    // Fatura verilerini session storage'a kaydet
    sessionStorage.setItem(`invoice_${invoice.id}`, JSON.stringify(invoice));
    
    // Yeni sayfaya yönlendir
    window.location.href = `/product-mapping/${invoice.id}`;
  };

  // PDF görüntüleme fonksiyonu
  const handleViewPDF = async (invoice: Invoice) => {
    try {
      console.log('📄 PDF indiriliyor:', invoice.id);
      
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { 
          action: 'get_pdf',
          invoiceId: invoice.id 
        }
      });

      if (data && data.success && data.pdfData) {
        // Base64 veriyi blob'a çevir
        const binaryString = atob(data.pdfData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Yeni sekmede aç
        window.open(url, '_blank');
        
        toast({
          title: "✅ Başarılı",
          description: "PDF açıldı"
        });
      } else {
        throw new Error(data?.message || 'PDF alınamadı');
      }
    } catch (error: any) {
      console.error('❌ PDF view error:', error);
      toast({
        title: "❌ Hata",
        description: error.message || "PDF görüntülenirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Fatura yükleme fonksiyonu
  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Faturaları yükleniyor...');
      
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { action: 'fetch_incoming' }
      });

      console.log('📥 API Response:', data);

      if (data && data.success) {
        setInvoices(data.invoices || []);
        console.log('🎯 Debug Info:', data.debug);
        toast({
          title: "✅ Başarılı",
          description: `${data.invoices?.length || 0} fatura yüklendi`
        });
      } else {
        console.error('❌ API Response Error:', data);
        throw new Error(data?.message || data?.error || 'Faturalar yüklenemedi');
      }
    } catch (error: any) {
      console.error('❌ Load invoices error:', error);
      toast({
        title: "❌ Hata",
        description: error.message || "Faturalar yüklenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Dikkat alma fonksiyonu
  const handleDikkateAlma = async (invoice: Invoice) => {
    toast({
      title: "Dikkat Alma",
      description: "Bu fatura dikkate alınmayanlara eklendi"
    });
  };

  // Reddetme fonksiyonu  
  const handleReddet = async (invoice: Invoice) => {
    toast({
      title: "Reddetme",
      description: "Bu fatura reddedildi"
    });
  };

  // Tab sayılarını hesapla
  const getTabCount = (tabType: string) => {
    switch(tabType) {
      case 'gelen':
        return filteredInvoices.filter(inv => inv.status === 'received' || inv.status === 'pending').length;
      case 'giden':
        return filteredInvoices.filter(inv => inv.status === 'sent').length;
      case 'dikkate-alinmayanlar':
        return 3; // Örnek sayı
      case 'reddedilenler':
        return 0; // Örnek sayı
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SİZE GELEN E-FATURALAR ve E-İRSALİYELER</h1>
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
              onClick={loadInvoices}
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
              <span className="ml-2 text-gray-600">Faturalar yükleniyor...</span>
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
                  {/* Fatura Header */}
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
                      onClick={() => handleViewPDF(invoice)}
                      className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                    >
                      📄 Yazdır
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => processInvoiceForMapping(invoice)}
                      className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    >
                      ✅ Detay
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}