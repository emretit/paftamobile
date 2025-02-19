
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string | null;
  unit_price: number;
  purchase_price: number;
  tax_rate: number;
  discount_rate: number;
  product_type: string;
  category_type: string;
  sku: string | null;
  barcode: string | null;
  stock_quantity: number;
  stock_threshold: number;
  min_order_quantity: number;
  max_order_quantity: number | null;
  unit: string;
  status: string;
  is_active: boolean;
  image_url: string | null;
  warranty_period: string | null;
  notes: string | null;
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

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  const getStockStatusBadge = (status: string, quantity: number, threshold: number) => {
    if (status === 'out_of_stock') {
      return <Badge variant="destructive">Stokta Yok</Badge>;
    } else if (status === 'low_stock') {
      return (
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <Badge variant="warning">Kritik Stok ({quantity})</Badge>
        </div>
      );
    }
    return <Badge variant="default">Stokta ({quantity})</Badge>;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="p-4">
          <div className="flex flex-col h-full">
            {product.image_url && (
              <div className="mb-4 aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-lg">{product.name}</h3>
              <Badge variant={product.is_active ? "default" : "secondary"}>
                {product.is_active ? "Aktif" : "Pasif"}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-500 mb-2">
              {product.product_categories?.name || "Kategorisiz"}
            </div>
            
            <div className="flex-1 mb-4">
              <p className="text-sm text-gray-600">
                {product.description || "Açıklama yok"}
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Fiyat:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">₺{product.unit_price.toFixed(2)}</span>
                  {product.discount_rate > 0 && (
                    <Badge variant="secondary">%{product.discount_rate} İndirim</Badge>
                  )}
                </div>
              </div>
              
              {product.product_type === "physical" && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Stok:</span>
                  {getStockStatusBadge(product.status, product.stock_quantity, product.stock_threshold)}
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span>Tür:</span>
                <span>
                  {product.category_type === "product" ? "Ürün" : 
                   product.category_type === "service" ? "Hizmet" : "Abonelik"}
                </span>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/product-form/${product.id}`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600"
                onClick={() => handleDelete(product.id)}
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

