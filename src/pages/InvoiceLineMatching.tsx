import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Save,
  Package,
  FileText,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InvoiceLine {
  invoice_uuid: string;
  invoice_number: string;
  invoice_date: string;
  supplier_name: string;
  supplier_tax_number: string;
  invoice_total: number;
  line_number: number;
  line_id: string;
  product_code: string;
  product_name: string;
  product_gtip: string;
  quantity: number;
  unit: string;
  unit_price: number;
  line_total: number;
  tax_rate: number;
  matched_stock_id: string | null;
  matched_stock_name: string;
  is_matched: boolean;
}

interface StockProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  stock_quantity: number;
  unit: string;
}

export default function InvoiceLineMatching() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([]);
  const [stockProducts, setStockProducts] = useState<StockProduct[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<Record<string, string>>({});

  // Fatura satırlarını ve stok ürünlerini yükle
  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Fatura satırları yükleniyor...');
      
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { 
          action: 'list_incoming_invoice_lines'
        }
      });

      console.log('📥 API Response:', data);

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw error;
      }

      if (data && data.success) {
        setInvoiceLines(data.invoice_lines || []);
        setStockProducts(data.stock_products || []);
        
        toast({
          title: "✅ Veriler Yüklendi",
          description: data.message || "Fatura satırları hazır"
        });
      } else {
        throw new Error(data?.error || 'Veriler yüklenemedi');
      }
    } catch (error: any) {
      console.error('❌ Load error:', error);
      toast({
        title: "❌ Yükleme Hatası",
        description: error.message || "Veriler yüklenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Eşleştirmeleri kaydet
  const saveMatching = async () => {
    const matchesToSave = Object.entries(selectedMatches).map(([lineKey, stockId]) => {
      const [invoiceUuid, lineId] = lineKey.split('|');
      const line = invoiceLines.find(l => l.invoice_uuid === invoiceUuid && l.line_id === lineId);
      const stock = stockProducts.find(s => s.id === stockId);
      
      return {
        invoice_uuid: invoiceUuid,
        line_id: lineId,
        invoice_product_code: line?.product_code || '',
        invoice_product_name: line?.product_name || '',
        selected_stock_id: stockId,
        selected_stock_name: stock?.name || ''
      };
    });

    if (matchesToSave.length === 0) {
      toast({
        title: "⚠️ Uyarı",
        description: "Kaydedilecek eşleştirme bulunamadı",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { 
          action: 'save_manual_matching',
          matches: matchesToSave
        }
      });

      if (error) throw error;

      if (data && data.success) {
        toast({
          title: "✅ Kayıt Başarılı",
          description: `${matchesToSave.length} eşleştirme kaydedildi`
        });
        
        // Eşleştirmeleri temizle
        setSelectedMatches({});
      } else {
        throw new Error(data?.error || 'Kayıt başarısız');
      }
    } catch (error: any) {
      console.error('❌ Save error:', error);
      toast({
        title: "❌ Kayıt Hatası",
        description: error.message || "Kayıt sırasında hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Stok ürünü seçimi
  const handleStockSelection = (lineKey: string, stockId: string) => {
    setSelectedMatches(prev => ({
      ...prev,
      [lineKey]: stockId
    }));
  };

  // Eşleştirmeyi kaldır
  const handleRemoveMatch = (lineKey: string) => {
    setSelectedMatches(prev => {
      const updated = { ...prev };
      delete updated[lineKey];
      return updated;
    });
  };

  // Fatura gruplama
  const groupedInvoices = invoiceLines.reduce((groups, line) => {
    const key = line.invoice_uuid;
    if (!groups[key]) {
      groups[key] = {
        invoice_number: line.invoice_number,
        invoice_date: line.invoice_date,
        supplier_name: line.supplier_name,
        invoice_total: line.invoice_total,
        lines: []
      };
    }
    groups[key].lines.push(line);
    return groups;
  }, {} as Record<string, any>);

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Fatura satırları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/orders/purchase')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
          <div>
            <h1 className="text-2xl font-bold">E-Fatura Ürün Satırları Eşleştirme</h1>
            <p className="text-muted-foreground">
              Gelen faturaların ürün satırlarını stok ürünlerinizle eşleştirin
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
          <Button
            onClick={saveMatching}
            disabled={isSaving || Object.keys(selectedMatches).length === 0}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Eşleştirmeleri Kaydet ({Object.keys(selectedMatches).length})
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Toplam Fatura</p>
                <p className="text-2xl font-bold">{Object.keys(groupedInvoices).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Toplam Satır</p>
                <p className="text-2xl font-bold">{invoiceLines.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Seçilen</p>
                <p className="text-2xl font-bold text-green-600">
                  {Object.keys(selectedMatches).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Kalan</p>
                <p className="text-2xl font-bold text-orange-600">
                  {invoiceLines.length - Object.keys(selectedMatches).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fatura Satırları Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Fatura Satırları ve Stok Eşleştirme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Fatura Numarası</th>
                  <th className="text-left p-3 font-semibold">Fatura Tarihi</th>
                  <th className="text-left p-3 font-semibold">Satır No</th>
                  <th className="text-left p-3 font-semibold">Mal/Hizmet Kodu</th>
                  <th className="text-left p-3 font-semibold">Mal/Hizmet Adı</th>
                  <th className="text-left p-3 font-semibold">Miktar</th>
                  <th className="text-left p-3 font-semibold">Birim</th>
                  <th className="text-left p-3 font-semibold">Tutar</th>
                  <th className="text-left p-3 font-semibold">Stoktan Eşleştir</th>
                  <th className="text-left p-3 font-semibold">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedInvoices).map(([invoiceUuid, invoice]) => (
                  <React.Fragment key={invoiceUuid}>
                    {invoice.lines.map((line: InvoiceLine, lineIndex: number) => {
                      const lineKey = `${line.invoice_uuid}|${line.line_id}`;
                      const selectedStockId = selectedMatches[lineKey];
                      const selectedStock = selectedStockId ? stockProducts.find(s => s.id === selectedStockId) : null;
                      
                      return (
                        <tr key={lineKey} className="border-b hover:bg-muted/30">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{line.invoice_number}</p>
                              <p className="text-sm text-muted-foreground">{line.supplier_name}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            {new Date(line.invoice_date).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="p-3">{line.line_number}</td>
                          <td className="p-3">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {line.product_code || '-'}
                            </code>
                          </td>
                          <td className="p-3">
                            <p className="font-medium">{line.product_name}</p>
                            {line.product_gtip && (
                              <p className="text-xs text-muted-foreground">GTIP: {line.product_gtip}</p>
                            )}
                          </td>
                          <td className="p-3">{line.quantity}</td>
                          <td className="p-3">{line.unit}</td>
                          <td className="p-3">
                            <p className="font-medium">{line.line_total.toLocaleString('tr-TR')} ₺</p>
                            <p className="text-xs text-muted-foreground">
                              Birim: {line.unit_price.toLocaleString('tr-TR')} ₺
                            </p>
                          </td>
                          <td className="p-3">
                            <Select
                              value={selectedStockId || ''}
                              onValueChange={(value) => handleStockSelection(lineKey, value)}
                            >
                              <SelectTrigger className="w-64">
                                <SelectValue placeholder="Stok ürünü seçin..." />
                              </SelectTrigger>
                              <SelectContent>
                                {stockProducts.map((stock) => (
                                  <SelectItem key={stock.id} value={stock.id}>
                                    <div className="flex justify-between items-center w-full">
                                      <div>
                                        <p className="font-medium">{stock.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {stock.sku} | Stok: {stock.stock_quantity} {stock.unit}
                                        </p>
                                      </div>
                                      <p className="text-sm ml-4">
                                        {stock.price.toLocaleString('tr-TR')} ₺
                                      </p>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {selectedStock && (
                              <div className="mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  ✅ {selectedStock.name}
                                </Badge>
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            {selectedStockId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMatch(lineKey)}
                              >
                                Kaldır
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 