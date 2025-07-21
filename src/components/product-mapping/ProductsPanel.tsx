import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import ProductMappingRow from './ProductMappingRow';
import { ProductMapping, ExistingProduct } from '@/types/productMapping';

interface ProductsPanelProps {
  productMappings: ProductMapping[];
  existingProducts: ExistingProduct[];
  onMappingChange: (index: number, selectedValue: string) => void;
}

const ProductsPanel: React.FC<ProductsPanelProps> = ({
  productMappings,
  existingProducts,
  onMappingChange
}) => {
  return (
    <Card>
      <CardHeader className="bg-green-500 text-white">
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          ÜRÜN / HİZMETLER
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-100">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-gray-700">#</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Kod</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Açıklama</th>
                <th className="p-3 text-center text-sm font-medium text-gray-700">Miktar</th>
                <th className="p-3 text-right text-sm font-medium text-gray-700">Fiyat</th>
                <th className="p-3 text-right text-sm font-medium text-gray-700">Tutar</th>
                <th className="p-3 text-center text-sm font-medium text-gray-700">Eşleştir</th>
                <th className="p-3 text-center text-sm font-medium text-gray-700">Durum</th>
              </tr>
            </thead>
            <tbody>
              {productMappings.map((mapping, index) => (
                <ProductMappingRow
                  key={index}
                  mapping={mapping}
                  index={index}
                  existingProducts={existingProducts}
                  onMappingChange={onMappingChange}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Özet Kısım */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-right">
                <span className="text-sm text-gray-600">Brüt Toplam:</span>
              </div>
              <div className="text-right">
                <span className="font-semibold">
                  {productMappings
                    .reduce((sum, m) => sum + m.parsedProduct.line_total, 0)
                    .toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-right">
                <span className="text-sm text-gray-600">İndirim:</span>
              </div>
              <div className="text-right">
                <span className="font-semibold">0,00 TL</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-right">
                <span className="text-sm text-gray-600">Net Toplam:</span>
              </div>
              <div className="text-right">
                <span className="font-semibold">
                  {productMappings
                    .reduce((sum, m) => sum + m.parsedProduct.line_total, 0)
                    .toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-right">
                <span className="text-sm text-gray-600">KDV (%20):</span>
              </div>
              <div className="text-right">
                <span className="font-semibold">
                  {productMappings
                    .reduce((sum, m) => sum + (m.parsedProduct.tax_amount || 0), 0)
                    .toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="text-right">
                <span className="text-lg font-bold">TOPLAM:</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-green-600">
                  {productMappings
                    .reduce((sum, m) => sum + m.parsedProduct.line_total + (m.parsedProduct.tax_amount || 0), 0)
                    .toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductsPanel;