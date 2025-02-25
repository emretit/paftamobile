
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Edit, ArrowLeft } from "lucide-react";
import ProductBasicInfo from "@/components/products/details/ProductBasicInfo";
import ProductPricing from "@/components/products/details/ProductPricing";
import ProductInventory from "@/components/products/details/ProductInventory";
import ProductImage from "@/components/products/details/ProductImage";
import ProductMeta from "@/components/products/details/ProductMeta";

interface ProductDetailsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProductDetails = ({ isCollapsed, setIsCollapsed }: ProductDetailsProps) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_categories (
            id,
            name
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold mb-4">Ürün bulunamadı</h2>
        <Button onClick={() => navigate("/products")}>Ürünlere Dön</Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
        </div>
        <Button onClick={() => navigate(`/product-form/${id}`)} className="gap-2">
          <Edit className="h-4 w-4" />
          Düzenle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <ProductBasicInfo
            name={product.name}
            description={product.description}
            category={product.product_categories?.name}
            productType={product.product_type}
            barcode={product.barcode}
            sku={product.sku}
          />

          <ProductPricing
            unitPrice={product.unit_price}
            purchasePrice={product.purchase_price}
            taxRate={product.tax_rate}
            discountRate={product.discount_rate}
          />

          <ProductInventory
            stockQuantity={product.stock_quantity}
            stockThreshold={product.stock_threshold}
            minOrderQuantity={product.min_order_quantity}
            maxOrderQuantity={product.max_order_quantity}
            unit={product.unit}
          />
        </div>

        <div className="space-y-6">
          <ProductImage
            imageUrl={product.image_url}
            productName={product.name}
          />

          <ProductMeta
            warrantyPeriod={product.warranty_period}
            notes={product.notes}
            createdAt={product.created_at}
            updatedAt={product.updated_at}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
