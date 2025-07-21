import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import InvoiceDetailsPanel from '@/components/product-mapping/InvoiceDetailsPanel';
import ProductsPanel from '@/components/product-mapping/ProductsPanel';
import { useProductMapping } from '@/components/product-mapping/hooks/useProductMapping';

interface ProductMappingProps {
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

export default function ProductMapping({ 
  isCollapsed = false, 
  setIsCollapsed = () => {} 
}: ProductMappingProps) {
  const {
    invoice,
    parsedProducts,
    existingProducts,
    productMappings,
    isLoading,
    isSaving,
    handleMappingChange,
    saveMappings,
    navigate
  } = useProductMapping();

  const handleBack = () => {
    navigate('/orders/purchase');
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
            Geri Dön
          </Button>
          
          {!isLoading && productMappings.length > 0 && (
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
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ürünler Yükleniyor</h3>
                <p className="text-gray-500">
                  Fatura XML'i parse ediliyor ve ürün bilgileri çıkarılıyor...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : parsedProducts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ürün Bulunamadı</h3>
                <p className="text-gray-500 mb-4">
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
          <div className="grid grid-cols-12 gap-6">
            {/* Sol Panel - Evrak Bilgileri */}
            <div className="col-span-5">
              <InvoiceDetailsPanel invoice={invoice} />
            </div>

            {/* Sağ Panel - Ürün/Hizmetler */}
            <div className="col-span-7">
              <ProductsPanel
                productMappings={productMappings}
                existingProducts={existingProducts}
                onMappingChange={handleMappingChange}
              />
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}