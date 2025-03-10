
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Edit, ArrowLeft, Copy, Download, Package2 } from "lucide-react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data: productData, error } = await supabase
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

      const transformedData: Product = {
        ...productData,
        formatted_description: {},
        last_purchase_date: null,
        related_products: [],
        product_categories: productData.product_categories || null,
        suppliers: null
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

  const handleEdit = () => {
    navigate(`/product-form/${id}`);
  };

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
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-16 items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 ml-4">
            <Package2 className="h-5 w-5" />
            <h1 className="text-lg font-semibold">{product.name}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" onClick={() => duplicateProductMutation.mutate()}>
              <Copy className="h-4 w-4 mr-2" />
              Kopyala
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={product.is_active ? "default" : "secondary"}>
              {product.is_active ? "Aktif" : "Pasif"}
            </Badge>
            <Badge variant={
              product.stock_quantity <= 0 ? "destructive" : 
              product.stock_quantity <= product.min_stock_level ? "warning" : 
              "default"
            }>
              {product.stock_quantity <= 0 ? "Stokta Yok" : 
               product.stock_quantity <= product.min_stock_level ? "Düşük Stok" : 
               "Stokta"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              SKU: {product.sku || "N/A"}
            </span>
          </div>

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
                onUpdate={updateProductMutation.mutate}
              />
            </CustomTabsContent>
            
            <CustomTabsContent value="pricing" className="mt-6">
              <ProductPricing
                price={product.price}
                discountPrice={product.discount_price}
                currency={product.currency}
                taxRate={product.tax_rate}
                onUpdate={updateProductMutation.mutate}
              />
            </CustomTabsContent>
            
            <CustomTabsContent value="stock" className="mt-6">
              <ProductInventory
                stockQuantity={product.stock_quantity}
                minStockLevel={product.min_stock_level}
                unit={product.unit}
                supplier={product.suppliers}
                lastPurchaseDate={product.last_purchase_date}
                onUpdate={updateProductMutation.mutate}
              />
            </CustomTabsContent>
            
            <CustomTabsContent value="related" className="mt-6">
              <ProductRelated 
                categoryId={product.category_id} 
                currentProductId={product.id}
                relatedProducts={product.related_products}
                onUpdate={updateProductMutation.mutate}
              />
            </CustomTabsContent>
          </CustomTabs>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
