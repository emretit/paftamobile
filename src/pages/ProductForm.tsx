
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

interface ProductFormProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProductForm = ({ isCollapsed, setIsCollapsed }: ProductFormProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    category_type: "product",
    unit_price: 0,
    tax_rate: 18,
    discount_rate: 0,
    stock_quantity: 0,
    stock_threshold: 5,
    is_active: true,
    product_type: "physical",
    unit: "piece",
    purchase_price: 0,
    min_order_quantity: 1,
    max_order_quantity: null as number | null,
    notes: "",
  });

  const { data: categories } = useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    }
  });

  const { data: product } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        category_id: product.category_id || "",
        category_type: product.category_type,
        unit_price: product.unit_price,
        tax_rate: product.tax_rate,
        discount_rate: product.discount_rate || 0,
        stock_quantity: product.stock_quantity || 0,
        stock_threshold: product.stock_threshold || 5,
        is_active: product.is_active,
        product_type: product.product_type,
        unit: product.unit || "piece",
        purchase_price: product.purchase_price || 0,
        min_order_quantity: product.min_order_quantity || 1,
        max_order_quantity: product.max_order_quantity,
        notes: product.notes || "",
      });
      setPreviewUrl(product.image_url);
    }
  }, [product]);

  const calculateFinalPrice = () => {
    const basePrice = formData.unit_price;
    const withTax = basePrice * (1 + formData.tax_rate / 100);
    const withDiscount = withTax * (1 - formData.discount_rate / 100);
    return withDiscount.toFixed(2);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = product?.image_url;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const productData = {
        ...formData,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      };

      if (id) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Ürün başarıyla güncellendi');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success('Ürün başarıyla oluşturuldu');
      }

      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Ürün kaydedilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 transition-all duration-300 ${
        isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
      }`}>
        <div className="p-6 lg:p-8 max-w-[1000px] mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              {id ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
            </h1>
            <p className="text-gray-600">
              Ürün bilgilerini düzenleyin veya yeni ürün ekleyin
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Temel Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ürün Adı</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Select 
                        value={formData.category_id} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Tür</Label>
                      <Select 
                        value={formData.category_type} 
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          category_type: value,
                          product_type: value === 'product' ? 'physical' : 'digital'
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product">Ürün</SelectItem>
                          <SelectItem value="service">Hizmet</SelectItem>
                          <SelectItem value="subscription">Abonelik</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Açıklama</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fiyatlandırma</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unit_price">Birim Fiyat (₺)</Label>
                      <Input
                        id="unit_price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.unit_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, unit_price: parseFloat(e.target.value) }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tax_rate">KDV Oranı (%)</Label>
                      <Input
                        id="tax_rate"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.tax_rate}
                        onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseInt(e.target.value) }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discount_rate">İndirim Oranı (%)</Label>
                      <Input
                        id="discount_rate"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discount_rate}
                        onChange={(e) => setFormData(prev => ({ ...prev, discount_rate: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Son Fiyat (KDV ve İndirim Dahil)</div>
                    <div className="text-2xl font-bold">₺{calculateFinalPrice()}</div>
                  </div>
                </CardContent>
              </Card>

              {formData.category_type === 'product' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Stok Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stock_quantity">Stok Miktarı</Label>
                        <Input
                          id="stock_quantity"
                          type="number"
                          min="0"
                          value={formData.stock_quantity}
                          onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stock_threshold">Kritik Stok Seviyesi</Label>
                        <Input
                          id="stock_threshold"
                          type="number"
                          min="0"
                          value={formData.stock_threshold}
                          onChange={(e) => setFormData(prev => ({ ...prev, stock_threshold: parseInt(e.target.value) }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="unit">Birim</Label>
                        <Input
                          id="unit"
                          value={formData.unit}
                          onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Görsel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                      {previewUrl ? (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-48 rounded"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setImageFile(null);
                              setPreviewUrl(null);
                            }}
                          >
                            Kaldır
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4 flex text-sm leading-6 text-gray-600">
                            <label
                              htmlFor="image-upload"
                              className="relative cursor-pointer rounded-md bg-white font-semibold text-primary hover:text-primary/80"
                            >
                              <span>Görsel Yükle</span>
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={handleImageChange}
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Durum</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label>Aktif</Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/products')}
                >
                  İptal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Kaydediliyor...' : (id ? 'Güncelle' : 'Kaydet')}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProductForm;
