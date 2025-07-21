import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Loader2,
  Building,
  Calendar,
  DollarSign,
  Package,
  FileText,
  AlertCircle,
  CheckCircle,
  ShoppingCart,
  Plus,
  RotateCcw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import DefaultLayout from '@/components/layouts/DefaultLayout';

interface ParsedProduct {
  name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  unit: string;
  tax_rate: number;
  line_total: number;
  tax_amount?: number;
  discount_amount?: number;
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

interface ProductMappingProps {
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

export default function ProductMapping({ isCollapsed = false, setIsCollapsed = () => {} }: ProductMappingProps) {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [existingProducts, setExistingProducts] = useState<ExistingProduct[]>([]);
  const [productMappings, setProductMappings] = useState<ProductMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Mevcut ürünleri yükle
  const loadExistingProducts = async () => {
    try {
      console.log('🔄 Mevcut ürünler yükleniyor...');
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, price, category_type, stock_quantity, unit, tax_rate')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      console.log('✅ Mevcut ürünler yüklendi:', data?.length || 0);
      setExistingProducts(data || []);
      return data || [];
    } catch (error) {
      console.error('❌ Mevcut ürünler yüklenemedi:', error);
      toast({
        title: "❌ Hata",
        description: "Mevcut ürünler yüklenemedi",
        variant: "destructive",
      });
      return [];
    }
  };

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
      console.log('🔄 Fatura verileri yükleniyor...', invoiceId);
      
      // Fatura verilerini session storage'dan al
      const invoiceData = sessionStorage.getItem(`invoice_${invoiceId}`);
      if (invoiceData) {
        const parsedInvoice = JSON.parse(invoiceData);
        setInvoice(parsedInvoice);
        console.log('✅ Fatura bilgileri session storage\'dan alındı:', parsedInvoice.invoiceNumber);
      }

      // Önce mevcut ürünleri yükle
      const existingProductsData = await loadExistingProducts();

      // XML'den ürünleri parse et
      console.log('🔄 XML\'den ürünler parse ediliyor...');
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { 
          action: 'process_xml_invoice',
          invoiceId: invoiceId
        }
      });

      console.log('📥 XML Parse API Response:', data);

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw error;
      }

      if (data && data.success) {
        const products = data.xmlParsed || [];
        console.log('✅ Parse edilen ürünler:', products.length);
        console.log('🎯 İlk ürün örneği:', products[0]);
        
        setParsedProducts(products);
        
        // Otomatik eşleştirme önerileri oluştur
        const mappings = products.map((product: ParsedProduct) => {
          let suggestedProduct = null;
          
          // SKU ile eşleştirme
          if (product.sku) {
            suggestedProduct = existingProductsData.find(p => p.sku === product.sku);
          }
          
          // İsim ile eşleştirme
          if (!suggestedProduct && product.name) {
            suggestedProduct = existingProductsData.find(p => 
              p.name.toLowerCase().includes(product.name.toLowerCase()) ||
              product.name.toLowerCase().includes(p.name.toLowerCase())
            );
          }
          
          return {
            parsedProduct: product,
            selectedProductId: suggestedProduct?.id || null,
            action: 'create' // Varsayılan olarak yeni ürün oluştur
          } as ProductMapping;
        });
        
        setProductMappings(mappings);
        console.log('✅ Eşleştirme önerileri oluşturuldu:', mappings.length);
        
        if (products.length === 0) {
          toast({
            title: "⚠️ Uyarı",
            description: "Faturada ürün bilgisi bulunamadı",
            variant: "destructive",
          });
        } else {
          toast({
            title: "✅ Başarılı",
            description: `${products.length} ürün başarıyla parse edildi`,
          });
        }
      } else {
        console.error('❌ XML Parse başarısız:', data);
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
  const handleMappingChange = (index: number, selectedValue: string) => {
    const newMappings = [...productMappings];
    
    if (selectedValue === 'create') {
      // Yeni ürün oluştur
      newMappings[index] = {
        ...newMappings[index],
        selectedProductId: null,
        action: 'create'
      };
    } else if (selectedValue === 'skip') {
      // Atla
      newMappings[index] = {
        ...newMappings[index],
        selectedProductId: null,
        action: 'skip'
      };
    } else {
      // Mevcut ürünle eşleştir
      newMappings[index] = {
        ...newMappings[index],
        selectedProductId: selectedValue,
        action: 'update'
      };
    }
    
    setProductMappings(newMappings);
  };

  // Geri dön
  const handleBack = () => {
    navigate('/orders/purchase');
  };

  // Eşleştirmeleri kaydet
  const saveMappings = async () => {
    if (!invoice) return;
    
    setIsSaving(true);
    
    try {
      const processedMappings = productMappings.filter(m => m.action !== 'skip');
      const results = [];
      
      for (const mapping of processedMappings) {
        try {
          if (mapping.action === 'create') {
            // Yeni ürün oluştur
            const { data: newProduct, error } = await supabase
              .from('products')
              .insert({
                name: mapping.parsedProduct.name,
                sku: mapping.parsedProduct.sku,
                price: mapping.parsedProduct.unit_price,
                tax_rate: mapping.parsedProduct.tax_rate || 18,
                unit: mapping.parsedProduct.unit || 'Adet',
                currency: invoice.currency || 'TRY',
                category_type: 'product',
                product_type: 'physical',
                status: 'active',
                is_active: true,
                stock_quantity: 0,
                min_stock_level: 0,
                stock_threshold: 0,
                description: `Nilvera faturasından aktarılan ürün - Fatura No: ${invoice.invoiceNumber}`,
              })
              .select()
              .single();

            if (error) throw error;
            results.push({ type: 'created', product: newProduct });
          } else if (mapping.action === 'update' && mapping.selectedProductId) {
            // Mevcut ürünü güncelle
            const { data: updatedProduct, error } = await supabase
              .from('products')
              .update({
                price: mapping.parsedProduct.unit_price,
                tax_rate: mapping.parsedProduct.tax_rate || 18,
                updated_at: new Date().toISOString()
              })
              .eq('id', mapping.selectedProductId)
              .select()
              .single();

            if (error) throw error;
            results.push({ type: 'updated', product: updatedProduct });
          }
        } catch (error) {
          console.error('Ürün işleme hatası:', error);
          results.push({ type: 'error', error: error });
        }
      }

      const createdCount = results.filter(r => r.type === 'created').length;
      const updatedCount = results.filter(r => r.type === 'updated').length;
      const errorCount = results.filter(r => r.type === 'error').length;

      toast({
        title: "✅ Eşleştirme Tamamlandı",
        description: `${createdCount} ürün oluşturuldu, ${updatedCount} ürün güncellendi${errorCount > 0 ? `, ${errorCount} hata` : ''}`,
      });

      // Başarılı ise geri dön
      if (errorCount === 0) {
        setTimeout(() => {
          handleBack();
        }, 2000);
      }

    } catch (error: any) {
      console.error('❌ Kaydetme hatası:', error);
      toast({
        title: "❌ Hata",
        description: error.message || "Eşleştirmeler kaydedilirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Ürün Eşleştirme"
      subtitle={`${invoice?.invoiceNumber || 'Yükleniyor...'} - ${invoice?.supplierName || ''}`}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Satın Alma Listesine Dön
          </Button>
          
          {!isLoading && productMappings.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{productMappings.length}</span> ürün bulundu •{' '}
                <span className="text-success font-semibold">{productMappings.filter(m => m.action === 'create').length}</span> yeni •{' '}
                <span className="text-warning font-semibold">{productMappings.filter(m => m.action === 'update').length}</span> güncelleme
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
                {isSaving ? 'Kaydediliyor...' : 'Eşleştirmeleri Kaydet'}
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Ürünler Yükleniyor</h3>
                <p className="text-gray-600">
                  Fatura XML'i işleniyor ve ürün bilgileri çıkarılıyor...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : parsedProducts.length === 0 ? (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Ürün Bulunamadı</h3>
                <p className="text-gray-600 mb-4">
                  Bu faturada ürün bilgisi bulunamadı veya XML parse edilemedi.
                </p>
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Geri Dön
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Fatura Özet Bilgileri */}
            <Card className="border border-gray-200 shadow-sm card-gradient">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <FileText className="w-5 h-5 text-primary" />
                  Fatura Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tedarikçi</p>
                      <p className="font-semibold text-gray-900">{invoice?.supplierName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fatura Tarihi</p>
                      <p className="font-semibold text-gray-900">
                        {invoice ? format(new Date(invoice.invoiceDate), 'dd MMM yyyy', { locale: tr }) : '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Toplam Tutar</p>
                      <p className="font-semibold text-gray-900">
                        {invoice?.totalAmount.toLocaleString('tr-TR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} {invoice?.currency}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ürün Sayısı</p>
                      <p className="font-semibold text-gray-900">{parsedProducts.length} ürün</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ürün Eşleştirme Listesi */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Ürün Eşleştirmeleri
                  <Badge variant="secondary" className="ml-2">
                    {productMappings.length} ürün
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {productMappings.map((mapping, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-sm transition-shadow">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Sol: Faturadaki Ürün */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{index + 1}</span>
                          </div>
                          Faturadaki Ürün
                        </h4>
                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Ürün Adı</label>
                            <p className="font-semibold text-gray-900">{mapping.parsedProduct.name}</p>
                          </div>
                          
                          {mapping.parsedProduct.sku && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">SKU Kodu</label>
                              <p className="font-mono text-sm text-gray-700">{mapping.parsedProduct.sku}</p>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Miktar</label>
                              <p className="font-semibold">{mapping.parsedProduct.quantity} {mapping.parsedProduct.unit}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Birim Fiyat</label>
                              <p className="font-semibold text-success">
                                {mapping.parsedProduct.unit_price.toLocaleString('tr-TR', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })} ₺
                              </p>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-gray-200">
                            <label className="text-sm font-medium text-gray-600">Toplam Tutar</label>
                            <p className="text-lg font-bold text-primary">
                              {mapping.parsedProduct.line_total.toLocaleString('tr-TR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })} ₺
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Sağ: Eşleştirme Seçenekleri */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-primary" />
                          Eşleştirme Seçimi
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Bu ürünü nasıl işlemek istiyorsunuz?
                            </label>
                            <Select
                              value={
                                mapping.action === 'create' ? 'create' :
                                mapping.action === 'skip' ? 'skip' :
                                mapping.selectedProductId || 'create'
                              }
                              onValueChange={(value) => handleMappingChange(index, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="create">
                                  <div className="flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-success" />
                                    <span className="font-medium">Yeni Ürün Oluştur</span>
                                  </div>
                                </SelectItem>
                                
                                {existingProducts.length > 0 && (
                                  <>
                                    <div className="px-2 py-1.5 text-xs font-medium text-gray-500 bg-gray-50">
                                      Mevcut Ürünlerle Eşleştir
                                    </div>
                                    {existingProducts.map((product) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        <div className="flex flex-col">
                                          <span className="font-medium">{product.name}</span>
                                          <div className="flex items-center gap-2 text-xs text-gray-500">
                                            {product.sku && <span>SKU: {product.sku}</span>}
                                            <span>•</span>
                                            <span>{product.price.toLocaleString('tr-TR')} ₺</span>
                                            <span>•</span>
                                            <span>Stok: {product.stock_quantity}</span>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                                
                                <SelectItem value="skip">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Bu Ürünü Atla</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Durum Göstergesi */}
                          <div className="p-4 rounded-lg border-2 border-dashed">
                            {mapping.action === 'create' && (
                              <div className="flex items-center gap-2 text-success">
                                <Plus className="w-4 h-4" />
                                <span className="font-medium">Yeni ürün olarak sisteme eklenecek</span>
                              </div>
                            )}
                            {mapping.action === 'update' && mapping.selectedProductId && (
                              <div className="flex items-center gap-2 text-warning">
                                <RotateCcw className="w-4 h-4" />
                                <span className="font-medium">Mevcut ürün güncellenecek</span>
                              </div>
                            )}
                            {mapping.action === 'skip' && (
                              <div className="flex items-center gap-2 text-gray-500">
                                <AlertCircle className="w-4 h-4" />
                                <span className="font-medium">Bu ürün atlanacak</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
} 