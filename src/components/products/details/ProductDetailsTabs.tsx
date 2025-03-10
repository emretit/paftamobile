
import { 
  CustomTabs, 
  CustomTabsContent, 
  CustomTabsList, 
  CustomTabsTrigger 
} from "@/components/ui/custom-tabs";
import ProductGeneralInfo from "@/components/products/details/ProductGeneralInfo";
import ProductPricing from "@/components/products/details/ProductPricing";
import ProductInventory from "@/components/products/details/ProductInventory";
import ProductRelated from "@/components/products/details/ProductRelated";
import { Product } from "@/types/product";

interface ProductDetailsTabsProps {
  product: Product;
  onUpdate: (updates: Partial<Product>) => void;
}

const ProductDetailsTabs = ({ product, onUpdate }: ProductDetailsTabsProps) => {
  return (
    <div className="container">
      <CustomTabs defaultValue="general" className="w-full">
        <CustomTabsList className="w-full grid grid-cols-4">
          <CustomTabsTrigger value="general">Genel</CustomTabsTrigger>
          <CustomTabsTrigger value="pricing">Fiyatlandırma</CustomTabsTrigger>
          <CustomTabsTrigger value="stock">Stok</CustomTabsTrigger>
          <CustomTabsTrigger value="related">Benzer Ürünler</CustomTabsTrigger>
        </CustomTabsList>
        
        <CustomTabsContent value="general" className="mt-6">
          <ProductGeneralInfo
            product={product}
            onUpdate={onUpdate}
          />
        </CustomTabsContent>
        
        <CustomTabsContent value="pricing" className="mt-6">
          <ProductPricing
            price={product.price}
            discountPrice={product.discount_price}
            currency={product.currency}
            taxRate={product.tax_rate}
            onUpdate={onUpdate}
          />
        </CustomTabsContent>
        
        <CustomTabsContent value="stock" className="mt-6">
          <ProductInventory
            stockQuantity={product.stock_quantity}
            minStockLevel={product.min_stock_level}
            unit={product.unit}
            supplier={product.suppliers}
            lastPurchaseDate={product.last_purchase_date}
            onUpdate={onUpdate}
          />
        </CustomTabsContent>
        
        <CustomTabsContent value="related" className="mt-6">
          <ProductRelated 
            categoryId={product.category_id} 
            currentProductId={product.id}
            relatedProducts={product.related_products}
            onUpdate={onUpdate}
          />
        </CustomTabsContent>
      </CustomTabs>
    </div>
  );
};

export default ProductDetailsTabs;
