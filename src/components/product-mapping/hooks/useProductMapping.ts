import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ParsedProduct, 
  ExistingProduct, 
  ProductMapping, 
  Invoice 
} from '@/types/productMapping';

export const useProductMapping = () => {
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

  // Eşleştirme değişikliği
  const handleMappingChange = (index: number, selectedValue: string) => {
    const newMappings = [...productMappings];
    
    if (selectedValue === 'create') {
      newMappings[index] = {
        ...newMappings[index],
        selectedProductId: null,
        action: 'create'
      };
    } else if (selectedValue === 'skip') {
      newMappings[index] = {
        ...newMappings[index],
        selectedProductId: null,
        action: 'skip'
      };
    } else {
      newMappings[index] = {
        ...newMappings[index],
        selectedProductId: selectedValue,
        action: 'update'
      };
    }
    
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
          navigate('/orders/purchase');
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

  useEffect(() => {
    loadInvoiceData();
  }, [invoiceId]);

  return {
    invoice,
    parsedProducts,
    existingProducts,
    productMappings,
    isLoading,
    isSaving,
    handleMappingChange,
    saveMappings,
    navigate
  };
};