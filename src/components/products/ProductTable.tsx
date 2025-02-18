
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description: string | null;
  unit_price: number;
  tax_rate: number;
  product_type: "physical" | "service";
  sku: string | null;
  stock_quantity: number;
  unit: string;
  is_active: boolean;
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

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ürün Adı</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Tür</TableHead>
            <TableHead>Fiyat</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.product_categories?.name || "-"}</TableCell>
              <TableCell>
                {product.product_type === "physical" ? "Fiziksel Ürün" : "Hizmet"}
              </TableCell>
              <TableCell>₺{product.unit_price.toFixed(2)}</TableCell>
              <TableCell>
                {product.product_type === "physical" 
                  ? `${product.stock_quantity} ${product.unit}`
                  : "-"}
              </TableCell>
              <TableCell>
                <Badge variant={product.is_active ? "success" : "secondary"}>
                  {product.is_active ? "Aktif" : "Pasif"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
