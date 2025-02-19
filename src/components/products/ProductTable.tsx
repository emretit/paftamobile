
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  warranty_period: unknown | null;
  notes: string | null;
  product_categories: {
    id: string;
    name: string;
  } | null;
}

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
}

const ProductTable = ({ 
  products, 
  isLoading,
}: ProductTableProps) => {
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

  const handleRowClick = (id: string) => {
    navigate(`/product-details/${id}`);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ürün Adı</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Tür</TableHead>
              <TableHead>Satış Fiyatı</TableHead>
              <TableHead>Alış Fiyatı</TableHead>
              <TableHead>Stok Durumu</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                {[...Array(7)].map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead>Ürün Adı</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Tür</TableHead>
            <TableHead>Satış Fiyatı</TableHead>
            <TableHead>Alış Fiyatı</TableHead>
            <TableHead>Stok Durumu</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow 
              key={product.id}
              className="group hover:bg-gray-50/50 transition-colors"
            >
              <TableCell onClick={() => handleRowClick(product.id)} className="cursor-pointer">
                <div className="flex items-center gap-3">
                  {product.image_url ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200" />
                  )}
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {product.sku || 'SKU yok'}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell onClick={() => handleRowClick(product.id)} className="cursor-pointer">
                {product.product_categories?.name || "Kategorisiz"}
              </TableCell>
              <TableCell onClick={() => handleRowClick(product.id)} className="cursor-pointer">
                {product.category_type === "product" ? "Ürün" : 
                 product.category_type === "service" ? "Hizmet" : "Abonelik"}
              </TableCell>
              <TableCell onClick={() => handleRowClick(product.id)} className="cursor-pointer">
                <div className="space-y-1">
                  <div className="font-medium">₺{product.unit_price.toFixed(2)}</div>
                  {product.discount_rate > 0 && (
                    <Badge variant="secondary" className="font-normal">
                      %{product.discount_rate} İndirim
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell onClick={() => handleRowClick(product.id)} className="cursor-pointer">
                <div className="font-medium">₺{product.purchase_price.toFixed(2)}</div>
              </TableCell>
              <TableCell onClick={() => handleRowClick(product.id)} className="cursor-pointer">
                {product.stock_quantity}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
