
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { 
  getStockStatusClass, 
  getStockStatusIcon, 
  getStockStatusText,
  getStockWarning 
} from "../utils/stockStatusUtils";

interface ProductInfoSectionProps {
  product: Product;
  stockStatus: string;
  availableStock: number;
}

const ProductInfoSection: React.FC<ProductInfoSectionProps> = ({
  product,
  stockStatus,
  availableStock
}) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{product.name}</h3>
        <Badge variant="outline" className={getStockStatusClass(stockStatus)}>
          <span className="flex items-center space-x-1">
            {getStockStatusIcon(stockStatus)}
            <span>{getStockStatusText(stockStatus)}</span>
          </span>
        </Badge>
      </div>
      {product.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {product.description}
        </p>
      )}
      <div className="flex items-center mt-2 text-sm">
        <span className="mr-4">SKU: {product.sku || "-"}</span>
        <span>Stok: {availableStock} {product.unit}</span>
      </div>
      {getStockWarning(stockStatus)}
    </div>
  );
};

export default ProductInfoSection;
