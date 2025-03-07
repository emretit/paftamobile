import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Plus, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductFormSchema, productSchema } from "./ProductFormSchema";
import ProductGeneralSection from "./ProductGeneralSection";
import ProductPricingSection from "./ProductPricingSection";
import ProductInventorySection from "./ProductInventorySection";
import ProductSupplierSection from "./supplier/ProductSupplierSection";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ProductFormWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      barcode: "",
      price: 0,
      discount_price: null,
      stock_quantity: 0,
      min_stock_level: 0,
      tax_rate: 18,
      unit: "piece",
      is_active: true,
      currency: "TRY",
      category_type: "product",
      product_type: "physical",
      status: "active",
      image_url: null,
      category_id: "",
      supplier_id: "",
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          form.reset({
            ...data,
            description: data.description || "",
            sku: data.sku || "",
            barcode: data.barcode || "",
            image_url: data.image_url || null,
            category_id: data.category_id || "",
            supplier_id: data.supplier_id || "",
            discount_price: data.discount_price || null,
          });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Ürün bilgileri yüklenirken bir hata oluştu.");
      }
    };

    fetchProduct();
  }, [id, form]);

  const onSubmit = async (values: ProductFormSchema, addAnother = false) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        const updateData = {
          ...values,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from("products")
          .update(updateData)
          .eq("id", id);

        if (error) throw error;

        toast.success("Ürün başarıyla güncellendi");
        navigate(`/product-details/${id}`);
      } else {
        const insertData = {
          ...values,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error, data } = await supabase
          .from("products")
          .insert([insertData])
          .select()
          .single();

        if (error) throw error;

        toast.success("Ürün başarıyla oluşturuldu");
        
        if (addAnother) {
          form.reset();
        } else if (data) {
          navigate(`/product-details/${data.id}`);
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Ürün kaydedilirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!id) return;

    try {
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      
      if (product) {
        const newProduct = {
          ...product,
          name: `${product.name} (Kopya)`,
          sku: product.sku ? `${product.sku}-copy` : null,
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

        toast.success("Ürün başarıyla kopyalandı");
        if (data) {
          navigate(`/product-form/${data.id}`);
        }
      }
    } catch (error) {
      console.error("Error duplicating product:", error);
      toast.error("Ürün kopyalanırken bir hata oluştu");
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(id ? `/product-details/${id}` : "/products")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold">
              {isEditing ? "Ürünü Düzenle" : "Yeni Ürün"}
            </h1>
          </div>
          
          <div className="flex space-x-2">
            {isEditing && (
              <Button variant="outline" onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Ürünü Kopyala
              </Button>
            )}
            <Button 
              onClick={form.handleSubmit((values) => onSubmit(values, true))}
              variant="secondary"
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4 mr-2" />
              Kaydet ve Yeni Ekle
            </Button>
            <Button 
              onClick={form.handleSubmit((values) => onSubmit(values, false))}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Güncelle" : "Kaydet"}
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => onSubmit(values, false))}>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid grid-cols-4 mb-8">
                  <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
                  <TabsTrigger value="pricing">Fiyatlandırma</TabsTrigger>
                  <TabsTrigger value="inventory">Stok</TabsTrigger>
                  <TabsTrigger value="additional">Ek Bilgiler</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general">
                  <ProductGeneralSection form={form} />
                </TabsContent>
                
                <TabsContent value="pricing">
                  <ProductPricingSection form={form} />
                </TabsContent>
                
                <TabsContent value="inventory">
                  <ProductInventorySection form={form} />
                </TabsContent>
                
                <TabsContent value="additional">
                  <ProductSupplierSection form={form} />
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ProductFormWrapper;
