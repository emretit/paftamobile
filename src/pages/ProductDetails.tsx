
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Edit, ArrowLeft, Package, Banknote, Calendar, Box, Tag, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const ProductDetails = () => {
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
      return data as Product;
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Ürün bulunamadı</h2>
          <Button onClick={() => navigate("/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ürünlere Dön
          </Button>
        </div>
      </div>
    );
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
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/products")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Ürünlere Dön
        </Button>
        <Button onClick={() => navigate(`/product-form/${id}`)} className="gap-2">
          <Edit className="h-4 w-4" />
          Düzenle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {product.image_url ? (
            <div className="aspect-square rounded-xl overflow-hidden border bg-white">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="aspect-square rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Package className="h-20 w-20 text-gray-400" />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ürün Açıklaması</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {product.description || "Açıklama bulunmuyor."}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Tag className="h-4 w-4" />
              <span>{product.product_categories?.name || "Kategorisiz"}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Fiyat Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Satış Fiyatı</div>
                  <div className="text-xl font-semibold">₺{product.unit_price.toFixed(2)}</div>
                </div>
                {product.discount_rate > 0 && (
                  <Badge variant="secondary">%{product.discount_rate} İndirim</Badge>
                )}
                <div>
                  <div className="text-sm text-gray-500">Alış Fiyatı</div>
                  <div>₺{product.purchase_price.toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  Stok Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.product_type === "physical" ? (
                  <>
                    <div>
                      <div className="text-sm text-gray-500">Stok Durumu</div>
                      <div className="mt-1">
                        {getStockStatusBadge(product.status, product.stock_quantity, product.stock_threshold)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Kritik Stok Seviyesi</div>
                      <div>{product.stock_threshold} {product.unit}</div>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500">Bu ürün için stok takibi yapılmıyor.</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detay Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">SKU</div>
                  <div>{product.sku || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Barkod</div>
                  <div>{product.barcode || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Birim</div>
                  <div>{product.unit}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Kategori Türü</div>
                  <div>
                    {product.category_type === "product" ? "Ürün" : 
                     product.category_type === "service" ? "Hizmet" : "Abonelik"}
                  </div>
                </div>
                {product.warranty_period && (
                  <div>
                    <div className="text-sm text-gray-500">Garanti Süresi</div>
                    <div>{product.warranty_period}</div>
                  </div>
                )}
              </div>
              {product.notes && (
                <div>
                  <div className="text-sm text-gray-500">Notlar</div>
                  <div className="mt-1">{product.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
