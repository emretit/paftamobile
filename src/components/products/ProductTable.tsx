
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit as Edit2, Trash as Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
}

const ProductTable = ({ products, isLoading }: ProductTableProps) => {
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
              <TableHead>SKU/Barkod</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Fiyat</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                {[...Array(6)].map((_, cellIndex) => (
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

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: currency 
    }).format(price);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead>Ürün Adı</TableHead>
            <TableHead>SKU/Barkod</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Fiyat</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow 
              key={product.id}
              className="cursor-pointer hover:bg-gray-50"
            >
              <TableCell onClick={() => handleRowClick(product.id)}>
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
                      {product.description || 'Açıklama yok'}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell onClick={() => handleRowClick(product.id)}>
                <div className="space-y-1">
                  {product.sku && (
                    <div className="text-sm">
                      <span className="text-gray-500">SKU:</span> {product.sku}
                    </div>
                  )}
                  {product.barcode && (
                    <div className="text-sm">
                      <span className="text-gray-500">Barkod:</span> {product.barcode}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell onClick={() => handleRowClick(product.id)}>
                {product.product_categories?.name || "Kategorisiz"}
              </TableCell>
              <TableCell onClick={() => handleRowClick(product.id)}>
                <div className="space-y-1">
                  <div className="font-medium">
                    {formatPrice(product.price, product.currency)}
                  </div>
                  {product.discount_price && (
                    <Badge variant="secondary" className="font-normal">
                      İndirimli: {formatPrice(product.discount_price, product.currency)}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell onClick={() => handleRowClick(product.id)}>
                <div className="space-y-1">
                  <div className="font-medium">{product.stock_quantity}</div>
                  {product.stock_quantity <= product.min_stock_level && (
                    <Badge variant="destructive" className="font-normal">
                      Kritik Stok
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product-form/${product.id}`);
                    }}
                  >
                    <Edit2 className="h-4 w-4 text-gray-500" />
                  </button>
                  <button 
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(product.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </button>
                  <button 
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                  </button>
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
