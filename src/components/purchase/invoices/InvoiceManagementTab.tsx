import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Eye, 
  FileText, 
  Calendar, 
  DollarSign, 
  Building, 
  Loader2,
  Package
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Faturalardan ürünleri parse et ve eşleştirme sayfasına yönlendir
  const processInvoiceForMapping = async (invoice: Invoice) => {
    // Fatura verilerini session storage'a kaydet
    sessionStorage.setItem(`invoice_${invoice.id}`, JSON.stringify(invoice));
    
    // Yeni sayfaya yönlendir
    window.location.href = `/product-mapping/${invoice.id}`;
  };

  // Mevcut fatura yükleme fonksiyonu
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Fatura Yönetimi</h2>
          <p className="text-muted-foreground">
            Nilvera'dan gelen faturaları görüntüleyin ve ürünleri sisteme aktarın
          </p>
        </div>
        <Button 
          onClick={loadInvoices}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Yenile
        </Button>
      </div>

      {/* Fatura Listesi */}
      <div className="grid gap-4">
        {invoices.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Fatura Bulunamadı</h3>
                <p className="text-muted-foreground mb-4">
                  Henüz fatura yüklenmemiş. Yukarıdaki "Yenile" butonuna tıklayarak faturaları yükleyin.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-lg">{invoice.invoiceNumber}</span>
                      </div>
                      <Badge variant="secondary">{invoice.status}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{invoice.supplierName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {format(new Date(invoice.invoiceDate), 'dd.MM.yyyy', { locale: tr })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {invoice.totalAmount.toLocaleString('tr-TR')} {invoice.currency}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Vergi: {invoice.taxAmount.toLocaleString('tr-TR')} {invoice.currency}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => processInvoiceForMapping(invoice)}
                      className="flex items-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      Ürünleri Eşleştir
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Detay
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 