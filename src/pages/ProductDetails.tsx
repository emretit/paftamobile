
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, ArrowLeft, Package2, DollarSign, Boxes, Tag, Calendar } from "lucide-react";
import { format } from "date-fns";

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

  const stockStatus = product.stock_quantity <= 0 
    ? "Stokta Yok" 
    : product.stock_quantity <= product.stock_threshold 
    ? "Kritik Stok" 
    : "Stokta";

  const stockStatusColor = product.stock_quantity <= 0 
    ? "text-red-500" 
    : product.stock_quantity <= product.stock_threshold 
    ? "text-yellow-500" 
    : "text-green-500";

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
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package2 className="h-5 w-5" />
                Ürün Bilgileri
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Açıklama</label>
                  <p className="mt-1">{product.description || "Açıklama bulunmuyor"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Kategori</label>
                  <p className="mt-1">{product.product_categories?.name || "Kategorisiz"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Ürün Tipi</label>
                  <p className="mt-1 capitalize">{product.product_type}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Barkod</label>
                  <p className="mt-1">{product.barcode || "Barkod girilmemiş"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">SKU</label>
                  <p className="mt-1">{product.sku || "SKU girilmemiş"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fiyat Bilgileri
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Satış Fiyatı</label>
                  <p className="mt-1 text-lg font-medium">{product.unit_price} TL</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Alış Fiyatı</label>
                  <p className="mt-1 text-lg font-medium">{product.purchase_price || 0} TL</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">KDV Oranı</label>
                  <p className="mt-1">%{product.tax_rate}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">İndirim Oranı</label>
                  <p className="mt-1">%{product.discount_rate || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Boxes className="h-5 w-5" />
                Stok Bilgileri
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Stok Miktarı</label>
                  <p className={`mt-1 text-lg font-medium ${stockStatusColor}`}>
                    {product.stock_quantity} {product.unit}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Stok Durumu</label>
                  <p className={`mt-1 ${stockStatusColor}`}>{stockStatus}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Minimum Sipariş</label>
                  <p className="mt-1">{product.min_order_quantity || 1} {product.unit}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Maksimum Sipariş</label>
                  <p className="mt-1">{product.max_order_quantity || "Limit yok"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {product.image_url ? (
            <Card>
              <CardContent className="p-6">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-auto rounded-lg"
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                <p className="text-gray-500">Ürün görseli bulunmuyor</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Diğer Bilgiler
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Garanti Süresi</label>
                  <p className="mt-1">
                    {product.warranty_period ? String(product.warranty_period) : "Garanti süresi belirtilmemiş"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Notlar</label>
                  <p className="mt-1">{product.notes || "Not bulunmuyor"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Oluşturulma Tarihi</label>
                  <p className="mt-1">{format(new Date(product.created_at), 'dd.MM.yyyy HH:mm')}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Son Güncelleme</label>
                  <p className="mt-1">{format(new Date(product.updated_at), 'dd.MM.yyyy HH:mm')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
