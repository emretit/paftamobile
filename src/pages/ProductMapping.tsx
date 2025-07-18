import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  ArrowRight,
  Search,
  Package,
  CheckCircle,
  Loader2,
  Building,
  Calendar,
  DollarSign,
  X,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ParsedProduct {
  name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  unit: string;
  tax_rate: number;
  line_total: number;
}

interface ExistingProduct {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  category_type: string;
  stock_quantity: number;
  unit: string;
  tax_rate: number;
}

interface ProductMapping {
  parsedProduct: ParsedProduct;
  selectedProductId: string | null;
  action: 'create' | 'update' | 'skip';
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  supplierTaxNumber: string;
  invoiceDate: string;
  totalAmount: number;
  currency: string;
  taxAmount: number;
  status: string;
}

export default function ProductMapping() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [existingProducts, setExistingProducts] = useState<ExistingProduct[]>([]);
  const [productMappings, setProductMappings] = useState<ProductMapping[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Mevcut ürünleri yükle
  const loadExistingProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, price, category_type, stock_quantity, unit, tax_rate')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setExistingProducts(data || []);
    } catch (error) {
      console.error('Mevcut ürünler yüklenemedi:', error);
      toast({
        title: "❌ Hata",
        description: "Mevcut ürünler yüklenemedi",
        variant: "destructive",
      });
    }
  };

  // Fatura ve ürün verilerini yükle
  const loadInvoiceData = async () => {
    if (!invoiceId) return;
    
    setIsLoading(true);
    try {
      // Fatura verilerini session storage'dan al
      const invoiceData = sessionStorage.getItem(`invoice_${invoiceId}`);
      if (invoiceData) {
        setInvoice(JSON.parse(invoiceData));
      }

      // XML'den ürünleri parse et
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { 
          action: 'process_xml_invoice',
          invoiceId: invoiceId
        }
      });

      if (error) throw error;

      if (data && data.success) {
        const products = data.xmlParsed || [];
        setParsedProducts(products);
        
        // Mevcut ürünleri yükle
        await loadExistingProducts();
        
        // Otomatik eşleştirme önerileri oluştur
        const mappings = products.map((product: ParsedProduct) => {
          let suggestedProduct = null;
          
          // SKU ile eşleştirme
          if (product.sku) {
            suggestedProduct = existingProducts.find(p => p.sku === product.sku);
          }
          
          // İsim ile eşleştirme
          if (!suggestedProduct) {
            suggestedProduct = existingProducts.find(p => 
              p.name.toLowerCase().includes(product.name.toLowerCase()) ||
              product.name.toLowerCase().includes(p.name.toLowerCase())
            );
          }
          
          return {
            parsedProduct: product,
            selectedProductId: suggestedProduct?.id || null,
            action: suggestedProduct ? 'update' : 'create'
          } as ProductMapping;
        });
        
        setProductMappings(mappings);
      } else {
        throw new Error(data?.message || 'XML işlenemedi');
      }
    } catch (error: any) {
      console.error('❌ Veri yükleme hatası:', error);
      toast({
        title: "❌ Hata",
        description: error.message || "Veriler yüklenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoiceData();
  }, [invoiceId]);

  // Eşleştirme değişikliği
  const handleMappingChange = (index: number, productId: string | null, action: 'create' | 'update' | 'skip') => {
    const newMappings = [...productMappings];
    newMappings[index] = {
      ...newMappings[index],
      selectedProductId: productId,
      action: action
    };
    setProductMappings(newMappings);
  };

  // Eşleştirmeleri kaydet
  const saveMappings = async () => {
    if (!invoice) return;
    
    setIsSaving(true);
    
    try {
      const processedMappings = productMappings.filter(m => m.action !== 'skip');
      const results = [];
      
      for (const mapping of processedMappings) {
        if (mapping.action === 'create') {
          const { data, error } = await supabase
            .from('products')
            .insert({
              name: mapping.parsedProduct.name,
              sku: mapping.parsedProduct.sku,
              price: mapping.parsedProduct.unit_price,
              tax_rate: mapping.parsedProduct.tax_rate,
              unit: mapping.parsedProduct.unit,
              currency: invoice.currency,
              category_type: 'product',
              product_type: 'physical',
              status: 'active',
              is_active: true,
              stock_quantity: 0,
              description: `Nilvera faturasından aktarılan ürün - Fatura No: ${invoice.invoiceNumber}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (error) throw error;
          results.push({ action: 'created', product: data });
          
        } else if (mapping.action === 'update' && mapping.selectedProductId) {
          const { data, error } = await supabase
            .from('products')
            .update({
              price: mapping.parsedProduct.unit_price,
              tax_rate: mapping.parsedProduct.tax_rate,
              updated_at: new Date().toISOString()
            })
            .eq('id', mapping.selectedProductId)
            .select()
            .single();
          
          if (error) throw error;
          results.push({ action: 'updated', product: data });
        }
      }
      
      toast({
        title: "✅ Başarılı",
        description: `${results.length} ürün işlendi. ${results.filter(r => r.action === 'created').length} yeni, ${results.filter(r => r.action === 'updated').length} güncellendi.`
      });
      
      // Geri dön
      navigate('/purchase-management');
      
    } catch (error: any) {
      console.error('❌ Eşleştirme kaydetme hatası:', error);
      toast({
        title: "❌ Hata",
        description: error.message || "Eşleştirmeler kaydedilirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrelenmiş mevcut ürünler
  const filteredExistingProducts = existingProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Fatura verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/purchase-management')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Geri
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold">Ürün Eşleştirme</h1>
                <p className="text-sm text-gray-600">
                  Fatura No: {invoice?.invoiceNumber} - {invoice?.supplierName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {productMappings.length} ürün • {productMappings.filter(m => m.action === 'create').length} yeni • {productMappings.filter(m => m.action === 'update').length} güncelleme
              </div>
              <Button
                onClick={saveMappings}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Fatura Bilgileri */}
      {invoice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-4 gap-6">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Tedarikçi</p>
                    <p className="font-medium">{invoice.supplierName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Fatura Tarihi</p>
                    <p className="font-medium">
                      {format(new Date(invoice.invoiceDate), 'dd.MM.yyyy', { locale: tr })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Toplam Tutar</p>
                    <p className="font-medium">
                      {invoice.totalAmount.toLocaleString('tr-TR')} {invoice.currency}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Durum</p>
                    <Badge variant="secondary">{invoice.status}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ana İçerik */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Arama */}
        <div className="mb-6">
          <div className="flex items-center gap-2 max-w-md">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Mevcut ürünlerde ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {/* Ürün Eşleştirme Listesi */}
        <div className="space-y-4">
          {productMappings.map((mapping, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-12 min-h-[200px]">
                  {/* Faturadaki Ürün */}
                  <div className="col-span-5 bg-blue-50 p-6 border-r">
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">Faturadaki Ürün</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-lg text-blue-900">
                          {mapping.parsedProduct.name}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-blue-700 font-medium">SKU</p>
                          <p className="text-blue-800">{mapping.parsedProduct.sku || 'Yok'}</p>
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium">Birim Fiyat</p>
                          <p className="text-blue-800 font-semibold">
                            {mapping.parsedProduct.unit_price.toLocaleString('tr-TR')} {invoice?.currency}
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium">Miktar</p>
                          <p className="text-blue-800">{mapping.parsedProduct.quantity} {mapping.parsedProduct.unit}</p>
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium">KDV</p>
                          <p className="text-blue-800">%{mapping.parsedProduct.tax_rate}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-blue-200">
                        <p className="text-blue-700 font-medium">Toplam</p>
                        <p className="text-blue-900 font-bold text-lg">
                          {mapping.parsedProduct.line_total.toLocaleString('tr-TR')} {invoice?.currency}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ok */}
                  <div className="col-span-2 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <ArrowRight className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <Badge 
                        variant={
                          mapping.action === 'create' ? 'default' : 
                          mapping.action === 'update' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {mapping.action === 'create' ? 'Yeni Ürün' : 
                         mapping.action === 'update' ? 'Güncelle' : 'Atla'}
                      </Badge>
                    </div>
                  </div>

                  {/* Sistemdeki Ürün */}
                  <div className="col-span-5 bg-green-50 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-green-900">Sistemdeki Ürün</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <Select
                        value={mapping.selectedProductId || ''}
                        onValueChange={(value) => {
                          const action = value === '' ? 'create' : 'update';
                          handleMappingChange(index, value || null, action);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ürün seçin veya yeni oluştur" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">
                            <div className="flex items-center gap-2">
                              <Plus className="w-4 h-4" />
                              <span>Yeni Ürün Oluştur</span>
                            </div>
                          </SelectItem>
                          {filteredExistingProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{product.name}</span>
                                <span className="text-xs text-gray-500">
                                  {product.sku ? `SKU: ${product.sku}` : 'SKU: Yok'} • 
                                  {product.price.toLocaleString('tr-TR')} TL • 
                                  Stok: {product.stock_quantity}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Seçilen ürün detayları */}
                      {mapping.selectedProductId && (
                        <div className="space-y-3">
                          {(() => {
                            const selectedProduct = existingProducts.find(p => p.id === mapping.selectedProductId);
                            return selectedProduct ? (
                              <div className="bg-white p-4 rounded-lg border border-green-200">
                                <p className="font-medium text-lg text-green-900 mb-3">
                                  {selectedProduct.name}
                                </p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-green-700 font-medium">SKU</p>
                                    <p className="text-green-800">{selectedProduct.sku || 'Yok'}</p>
                                  </div>
                                  <div>
                                    <p className="text-green-700 font-medium">Mevcut Fiyat</p>
                                    <p className="text-green-800 font-semibold">
                                      {selectedProduct.price.toLocaleString('tr-TR')} TL
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-green-700 font-medium">Stok</p>
                                    <p className="text-green-800">{selectedProduct.stock_quantity} {selectedProduct.unit}</p>
                                  </div>
                                  <div>
                                    <p className="text-green-700 font-medium">KDV</p>
                                    <p className="text-green-800">%{selectedProduct.tax_rate}</p>
                                  </div>
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
                      
                      {/* Yeni ürün oluşturulacak */}
                      {!mapping.selectedProductId && (
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Plus className="w-4 h-4 text-green-600" />
                            <p className="font-medium text-green-900">Yeni Ürün Oluşturulacak</p>
                          </div>
                          <p className="text-sm text-green-700">
                            Bu ürün faturadaki bilgilerle sisteme yeni ürün olarak eklenecek.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 