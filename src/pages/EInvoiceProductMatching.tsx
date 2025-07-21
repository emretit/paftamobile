import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  RefreshCw,
  Save,
  Eye,
  Edit3,
  Package,
  Zap,
  User,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InvoiceProduct {
  line_id: string;
  invoice_product_code: string;
  invoice_product_name: string;
  invoice_product_gtip: string;
  invoice_quantity: number;
  invoice_unit: string;
  invoice_unit_price: number;
  invoice_total_amount: number;
  invoice_tax_rate: number;
  matched_stock_id: string | null;
  matched_stock_code: string;
  matched_stock_name: string;
  match_type: 'auto_code' | 'auto_name' | 'manual' | 'unmatched';
  match_confidence: number;
  match_notes: string;
  is_confirmed: boolean;
  suggested_matches?: Array<{
    stock_id: string;
    stock_name: string;
    stock_code: string;
    confidence: number;
  }>;
}

interface StockProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  stock_quantity: number;
  unit: string;
  description: string;
}

interface InvoiceInfo {
  id: string;
  nilvera_id: string;
  number: string;
  supplier: string;
  total_amount: number;
}

export default function EInvoiceProductMatching() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceInfo | null>(null);
  const [products, setProducts] = useState<InvoiceProduct[]>([]);
  const [stockProducts, setStockProducts] = useState<StockProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<InvoiceProduct | null>(null);
  const [isManualSelectOpen, setIsManualSelectOpen] = useState(false);

  // Fatura ve ürün verilerini yükle
  const loadInvoiceData = async () => {
    if (!invoiceId) {
      toast({
        title: "❌ Hata",
        description: "Fatura ID bulunamadı",
        variant: "destructive",
      });
      navigate('/orders/purchase');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('🔄 E-fatura ürün eşleştirme verileri yükleniyor...', invoiceId);
      
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { 
          action: 'fetch_and_match_products',
          invoiceId: invoiceId
        }
      });

      console.log('📥 API Response:', data);

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw error;
      }

      if (data && data.success) {
        setInvoice(data.invoice);
        setProducts(data.products || []);
        setStockProducts(data.stock_products || []);
        
        toast({
          title: "✅ Veriler Yüklendi",
          description: data.message || "E-fatura ürün eşleştirme hazır"
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

  // Ürün eşleştirmelerini kaydet
  const saveMatching = async () => {
    if (!invoice?.id) return;
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { 
          action: 'save_product_matching',
          invoiceId: invoice.id,
          matches: products
        }
      });

      if (error) throw error;

      if (data && data.success) {
        toast({
          title: "✅ Kayıt Başarılı",
          description: data.message || "Eşleştirmeler kaydedildi"
        });
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

  // Manuel ürün seçimi
  const handleManualMatch = (productIndex: number, stockId: string) => {
    const selectedStock = stockProducts.find(s => s.id === stockId);
    if (!selectedStock) return;

    const updatedProducts = [...products];
    updatedProducts[productIndex] = {
      ...updatedProducts[productIndex],
      matched_stock_id: stockId,
      matched_stock_code: selectedStock.sku || '',
      matched_stock_name: selectedStock.name,
      match_type: 'manual',
      match_confidence: 1.0,
      match_notes: 'Manuel olarak eşleştirildi',
      is_confirmed: true
    };

    setProducts(updatedProducts);
    setIsManualSelectOpen(false);
    setSelectedProduct(null);
  };

  // Eşleştirmeyi kaldır
  const handleRemoveMatch = (productIndex: number) => {
    const updatedProducts = [...products];
    updatedProducts[productIndex] = {
      ...updatedProducts[productIndex],
      matched_stock_id: null,
      matched_stock_code: '',
      matched_stock_name: '',
      match_type: 'unmatched',
      match_confidence: 0,
      match_notes: '',
      is_confirmed: false
    };

    setProducts(updatedProducts);
  };

  // Eşleştirme türüne göre badge rengi
  const getMatchTypeBadge = (product: InvoiceProduct) => {
    switch (product.match_type) {
      case 'auto_code':
        return <Badge variant="default" className="bg-green-500"><Zap className="w-3 h-3 mr-1" />Kod Eşleşmesi</Badge>;
      case 'auto_name':
        return <Badge variant="secondary" className="bg-blue-500 text-white"><Zap className="w-3 h-3 mr-1" />İsim Eşleşmesi</Badge>;
      case 'manual':
        return <Badge variant="outline" className="bg-orange-500 text-white"><User className="w-3 h-3 mr-1" />Manuel</Badge>;
      default:
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Eşleşmemiş</Badge>;
    }
  };

  // Filtrelenmiş stok ürünleri
  const filteredStockProducts = stockProducts.filter(stock =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadInvoiceData();
  }, [invoiceId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">E-fatura ürün verileri yükleniyor...</p>
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
            <h1 className="text-2xl font-bold">E-Fatura Ürün Eşleştirme</h1>
            {invoice && (
              <p className="text-muted-foreground">
                {invoice.supplier} - Fatura No: {invoice.number}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadInvoiceData}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
          <Button
            onClick={saveMatching}
            disabled={isSaving || products.length === 0}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Eşleştirmeleri Kaydet
          </Button>
        </div>
      </div>

      {/* Stats */}
      {invoice && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Ürün</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Eşleşen</p>
                  <p className="text-2xl font-bold text-green-600">
                    {products.filter(p => p.matched_stock_id).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Eşleşmeyen</p>
                  <p className="text-2xl font-bold text-red-600">
                    {products.filter(p => !p.matched_stock_id).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Fatura Tutarı</p>
                  <p className="text-lg font-bold">
                    {invoice.total_amount.toLocaleString('tr-TR')} ₺
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ürün Eşleştirme Tablosu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">#</th>
                  <th className="text-left p-3 font-semibold">Faturadaki Ürün Kodu / Adı</th>
                  <th className="text-left p-3 font-semibold">Miktar</th>
                  <th className="text-left p-3 font-semibold">Birim Fiyat</th>
                  <th className="text-left p-3 font-semibold">Eşleşen Stok Ürünü</th>
                  <th className="text-left p-3 font-semibold">Eşleşme Şekli</th>
                  <th className="text-left p-3 font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={`${product.line_id}-${index}`} className="border-b hover:bg-muted/50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{product.invoice_product_name}</p>
                        {product.invoice_product_code && (
                          <p className="text-sm text-muted-foreground">
                            Kod: {product.invoice_product_code}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {product.invoice_quantity} {product.invoice_unit}
                    </td>
                    <td className="p-3">
                      {product.invoice_unit_price.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="p-3">
                      {product.matched_stock_id ? (
                        <div>
                          <p className="font-medium">{product.matched_stock_name}</p>
                          {product.matched_stock_code && (
                            <p className="text-sm text-muted-foreground">
                              Kod: {product.matched_stock_code}
                            </p>
                          )}
                          {product.match_confidence > 0 && product.match_confidence < 1 && (
                            <p className="text-xs text-blue-600">
                              Güven: %{(product.match_confidence * 100).toFixed(0)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          <p>Eşleşme bulunamadı</p>
                          {product.suggested_matches && product.suggested_matches.length > 0 && (
                            <p className="text-xs text-blue-600">
                              {product.suggested_matches.length} öneri mevcut
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {getMatchTypeBadge(product)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Dialog 
                          open={isManualSelectOpen && selectedProduct?.line_id === product.line_id}
                          onOpenChange={(open) => {
                            setIsManualSelectOpen(open);
                            if (!open) setSelectedProduct(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                            >
                              <Edit3 className="w-3 h-3 mr-1" />
                              {product.matched_stock_id ? 'Değiştir' : 'Eşleştir'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Ürün Eşleştir: {product.invoice_product_name}</DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div>
                                <Input
                                  placeholder="Stok ürünlerinde ara..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="mb-4"
                                />
                              </div>
                              
                              <div className="max-h-96 overflow-y-auto space-y-2">
                                {/* Önerilen eşleşmeler önce */}
                                {product.suggested_matches && product.suggested_matches.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-sm mb-2 text-blue-600">Önerilen Eşleşmeler:</h4>
                                    {product.suggested_matches.map((match) => (
                                      <div
                                        key={match.stock_id}
                                        className="p-3 border rounded cursor-pointer hover:bg-blue-50 border-blue-200"
                                        onClick={() => handleManualMatch(index, match.stock_id)}
                                      >
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="font-medium">{match.stock_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                              Kod: {match.stock_code}
                                            </p>
                                          </div>
                                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                            %{(match.confidence * 100).toFixed(0)}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Tüm stok ürünleri */}
                                <div>
                                  <h4 className="font-medium text-sm mb-2">Tüm Stok Ürünleri:</h4>
                                  {filteredStockProducts.map((stock) => (
                                    <div
                                      key={stock.id}
                                      className="p-3 border rounded cursor-pointer hover:bg-muted/50"
                                      onClick={() => handleManualMatch(index, stock.id)}
                                    >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="font-medium">{stock.name}</p>
                                          <p className="text-sm text-muted-foreground">
                                            Kod: {stock.sku} | Stok: {stock.stock_quantity} {stock.unit}
                                          </p>
                                        </div>
                                        <p className="text-sm font-medium">
                                          {stock.price.toLocaleString('tr-TR')} ₺
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {product.matched_stock_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMatch(index)}
                          >
                            Kaldır
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
    </div>
  );
} 