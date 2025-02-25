
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  price: number;
  discount_price: number | null;
  currency: string;
  tax_rate: number;
  stock_quantity: number;
  min_stock_level: number;
  supplier_id: string | null;
  category_type: string;
  product_type: string;
  unit: string;
  status: string;
  is_active: boolean;
  image_url: string | null;
  product_categories: {
    id: string;
    name: string;
  } | null;
}

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
}

const ProductGrid = ({ products, isLoading }: ProductGridProps) => {
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Ürün başarıyla silindi');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Ürün silinirken bir hata oluştu');
    }
  };

  const handleCardClick = (id: string) => {
    navigate(`/product-details/${id}`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="p-4 animate-pulse">
            <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
            <div className="h-6 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: currency 
    }).format(price);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card 
          key={product.id} 
          className="group relative p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
          onClick={() => handleCardClick(product.id)}
        >
          <div className="flex flex-col h-full">
            <div className="relative">
              {product.image_url ? (
                <div className="mb-4 aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                  />
                </div>
              ) : (
                <div className="mb-4 aspect-video rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                  Görsel Yok
                </div>
              )}
              
              <Badge 
                variant={product.is_active ? "default" : "secondary"}
                className="absolute top-2 right-2"
              >
                {product.is_active ? "Aktif" : "Pasif"}
              </Badge>
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1 line-clamp-2">{product.name}</h3>
              
              <div className="text-sm text-gray-500 mb-2">
                {product.product_categories?.name || "Kategorisiz"}
              </div>
              
              <div className="line-clamp-2 text-sm text-gray-600 mb-4">
                {product.description || "Açıklama yok"}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Fiyat:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatPrice(product.price, product.currency)}</span>
                    {product.discount_price && (
                      <Badge variant="secondary">
                        İndirimli: {formatPrice(product.discount_price, product.currency)}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Stok:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{product.stock_quantity}</span>
                    {product.stock_quantity <= product.min_stock_level && (
                      <Badge variant="destructive">Kritik Stok</Badge>
                    )}
                  </div>
                </div>

                {product.sku && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">SKU:</span>
                    <span>{product.sku}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/product-form/${product.id}`);
                }}
                className="hover:bg-gray-100"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(product.id);
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;
