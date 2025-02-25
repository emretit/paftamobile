
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Edit, ArrowLeft, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductGeneralInfo from "@/components/products/details/ProductGeneralInfo";
import ProductPricing from "@/components/products/details/ProductPricing";
import ProductInventory from "@/components/products/details/ProductInventory";
import ProductRelated from "@/components/products/details/ProductRelated";
import { useState } from "react";
import { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";

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
      const { data: productData, error } = await supabase
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
          product_categories:product_categories (
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
        ...productData,
        formatted_description: {},
        last_purchase_date: null,
        related_products: [],
        product_categories: productData.product_categories || null,
        suppliers: productData.suppliers as any || null
      };

      return transformedData;
    },
  });

  const getStockStatusBadge = (quantity: number, minLevel: number) => {
    if (quantity <= 0) return <Badge variant="destructive">Stokta Yok</Badge>;
    if (quantity <= minLevel) return <Badge variant="warning">Düşük Stok</Badge>;
    return <Badge variant="default">Stokta</Badge>;
  };

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-gray-50 to-background dark:from-gray-900 dark:to-background">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" onClick={() => navigate("/products")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Product Image */}
            <div className="relative group">
              {product.image_url ? (
                <div className="relative overflow-hidden rounded-lg aspect-square bg-white dark:bg-gray-800">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="rounded-lg aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-400">Görsel Yok</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">SKU: {product.sku || "N/A"}</span>
                  {getStockStatusBadge(product.stock_quantity, product.min_stock_level)}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-2xl font-semibold">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: product.currency
                  }).format(product.price)}
                </span>
                {product.discount_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: product.currency
                    }).format(product.discount_price)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Floating Action Bar */}
          <div className="fixed bottom-6 right-6 flex gap-2 z-50">
            <Button variant="outline" onClick={() => duplicateProductMutation.mutate()}>
              <Copy className="h-4 w-4 mr-2" />
              Kopyala
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="general" className="mt-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
              <TabsTrigger value="pricing">Fiyatlandırma & Stok</TabsTrigger>
              <TabsTrigger value="related">Benzer Ürünler</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <ProductGeneralInfo
                product={product}
                onUpdate={updateProductMutation.mutate}
              />
            </TabsContent>
            
            <TabsContent value="pricing" className="space-y-6">
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
            </TabsContent>
            
            <TabsContent value="related">
              <ProductRelated 
                categoryId={product.category_id} 
                currentProductId={product.id}
                relatedProducts={product.related_products}
                onUpdate={updateProductMutation.mutate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
