import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductMapping, ExistingProduct } from '@/types/productMapping';

interface ProductMappingRowProps {
  mapping: ProductMapping;
  index: number;
  existingProducts: ExistingProduct[];
  onMappingChange: (index: number, selectedValue: string) => void;
}

const ProductMappingRow: React.FC<ProductMappingRowProps> = ({
  mapping,
  index,
  existingProducts,
  onMappingChange
}) => {
  const { parsedProduct } = mapping;

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return <Badge variant="default" className="bg-green-500">Yeni Oluştur</Badge>;
      case 'update':
        return <Badge variant="secondary">Güncelle</Badge>;
      case 'skip':
        return <Badge variant="outline">Atla</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-3 text-sm text-center">{index + 1}</td>
      <td className="p-3 text-sm">{parsedProduct.sku || '-'}</td>
      <td className="p-3 text-sm font-medium">{parsedProduct.name}</td>
      <td className="p-3 text-sm text-center">{parsedProduct.quantity}</td>
      <td className="p-3 text-sm text-right">
        {parsedProduct.unit_price.toLocaleString('tr-TR', {
          style: 'currency',
          currency: 'TRY'
        })}
      </td>
      <td className="p-3 text-sm text-right">
        {parsedProduct.line_total.toLocaleString('tr-TR', {
          style: 'currency',
          currency: 'TRY'
        })}
      </td>
      <td className="p-3">
        <Select
          value={mapping.selectedProductId || mapping.action}
          onValueChange={(value) => onMappingChange(index, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seçin..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="create">🆕 Yeni Ürün Oluştur</SelectItem>
            <SelectItem value="skip">⏭️ Atla</SelectItem>
            {existingProducts.map(product => (
              <SelectItem key={product.id} value={product.id}>
                📦 {product.name} ({product.sku || 'SKU yok'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-3 text-center">
        {getActionBadge(mapping.action)}
      </td>
    </tr>
  );
};

export default ProductMappingRow;