
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Edit, ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ProductGeneralInfo from "@/components/products/details/ProductGeneralInfo";
import ProductPricing from "@/components/products/details/ProductPricing";
import ProductInventory from "@/components/products/details/ProductInventory";
import ProductRelated from "@/components/products/details/ProductRelated";
import { useState } from "react";
import { Product } from "@/types/product";

interface ProductDetailsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProductDetails = ({ isCollapsed, setIsCollapsed }: ProductDetailsProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          sku,
          barcode,
          price,
          discount_price,
          currency,
          tax_rate,
          stock_quantity,
          min_stock_level,
          unit,
          category_id,
          category_type,
          product_type,
          status,
          is_active,
          image_url,
          created_at,
          updated_at,
          product_categories (
            id,
            name
          ),
          suppliers (
            id,
            name,
            email,
            phone
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      // Transform the data to match the Product interface
      const transformedData: Product = {
        ...data,
        formatted_description: data.formatted_description || {},
        last_purchase_date: data.last_purchase_date || null,
        related_products: data.related_products || [],
        product_categories: data.product_categories || null,
        suppliers: data.suppliers || null
      };

      return transformedData;
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (updates: Partial<Product>) => {
      const { error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      toast.success("Ürün başarıyla güncellendi");
    },
    onError: () => {
      toast.error("Ürün güncellenirken bir hata oluştu");
    },
  });

  const duplicateProductMutation = useMutation({
    mutationFn: async () => {
      if (!product) return;
      
      const newProduct = {
        ...product,
        name: `${product.name} (Kopya)`,
        sku: `${product.sku}-copy`,
        barcode: null,
      };
      
      delete newProduct.id;
      delete newProduct.created_at;
      delete newProduct.updated_at;

      const { data, error } = await supabase
        .from("products")
        .insert([newProduct])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newProduct) => {
      toast.success("Ürün başarıyla kopyalandı");
      navigate(`/product-details/${newProduct.id}`);
    },
    onError: () => {
      toast.error("Ürün kopyalanırken bir hata oluştu");
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
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => duplicateProductMutation.mutate()}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Ürünü Kopyala
          </Button>
          <Sheet open={isEditing} onOpenChange={setIsEditing}>
            <SheetTrigger asChild>
              <Button className="gap-2">
                <Edit className="h-4 w-4" />
                Düzenle
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[540px]">
              {/* Editing form will be implemented here */}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ProductGeneralInfo
            product={product}
            onUpdate={updateProductMutation.mutate}
          />

          <ProductPricing
            price={product.price}
            discountPrice={product.discount_price}
            currency={product.currency}
            taxRate={product.tax_rate}
            onUpdate={updateProductMutation.mutate}
          />

          <ProductInventory
            stockQuantity={product.stock_quantity}
            minStockLevel={product.min_stock_level}
            unit={product.unit}
            supplier={product.suppliers}
            lastPurchaseDate={product.last_purchase_date}
            onUpdate={updateProductMutation.mutate}
          />
        </div>

        <div className="space-y-6">
          <ProductRelated 
            categoryId={product.category_id} 
            currentProductId={product.id}
            relatedProducts={product.related_products}
            onUpdate={updateProductMutation.mutate}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
