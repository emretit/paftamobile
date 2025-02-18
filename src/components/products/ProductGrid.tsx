
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description: string | null;
  unit_price: number;
  tax_rate: number;
  product_type: string;
  sku: string | null;
  stock_quantity: number;
  unit: string;
  is_active: boolean;
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

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="p-4">
          <div className="flex flex-col h-full">
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
              <div className="flex justify-between text-sm">
                <span>Fiyat:</span>
                <span className="font-medium">₺{product.unit_price.toFixed(2)}</span>
              </div>
              
              {product.product_type === "physical" && (
                <div className="flex justify-between text-sm">
                  <span>Stok:</span>
                  <span>{product.stock_quantity} {product.unit}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span>Tür:</span>
                <span>{product.product_type === "physical" ? "Fiziksel Ürün" : "Hizmet"}</span>
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
