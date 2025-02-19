
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProductFormProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const productSchema = z.object({
  name: z.string().min(1, "Ürün adı zorunludur"),
  description: z.string().optional(),
  unit_price: z.string().min(1, "Fiyat zorunludur"),
  stock_quantity: z.string().min(1, "Stok zorunludur"),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductForm = ({ isCollapsed, setIsCollapsed }: ProductFormProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      unit_price: "",
      stock_quantity: "",
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
            name: data.name,
            description: data.description || "",
            unit_price: data.unit_price.toString(),
            stock_quantity: data.stock_quantity.toString(),
          });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Ürün bilgileri yüklenirken bir hata oluştu.",
        });
      }
    };

    fetchProduct();
  }, [id, form, toast]);

  const onSubmit = async (values: ProductFormValues) => {
    setIsLoading(true);
    try {
      const productData = {
        name: values.name,
        description: values.description,
        unit_price: parseFloat(values.unit_price),
        stock_quantity: parseInt(values.stock_quantity),
      };

      if (id) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Başarılı",
          description: "Ürün başarıyla güncellendi.",
        });
      } else {
        const { error } = await supabase.from("products").insert(productData);

        if (error) throw error;

        toast({
          title: "Başarılı",
          description: "Ürün başarıyla oluşturuldu.",
        });
      }

      navigate("/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ürün kaydedilirken bir hata oluştu.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        {id ? "Ürün Düzenle" : "Yeni Ürün"}
      </h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ürün Adı</label>
          <Input {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Açıklama</label>
          <Textarea {...form.register("description")} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fiyat</label>
          <Input type="number" step="0.01" {...form.register("unit_price")} />
          {form.formState.errors.unit_price && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.unit_price.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stok</label>
          <Input type="number" {...form.register("stock_quantity")} />
          {form.formState.errors.stock_quantity && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.stock_quantity.message}
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {id ? "Güncelle" : "Oluştur"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/products")}
          >
            İptal
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
