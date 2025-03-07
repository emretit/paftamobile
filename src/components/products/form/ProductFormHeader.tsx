
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Plus, Copy } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ProductFormSchema } from "./ProductFormSchema";
import { useNavigate } from "react-router-dom";

interface ProductFormHeaderProps {
  isEditing: boolean;
  isSubmitting: boolean;
  productId: string | undefined;
  form: UseFormReturn<ProductFormSchema>;
  onSubmit: (values: ProductFormSchema, addAnother: boolean) => Promise<{ resetForm: boolean }>;
  onDuplicate: () => Promise<void>;
}

const ProductFormHeader = ({
  isEditing,
  isSubmitting,
  productId,
  form,
  onSubmit,
  onDuplicate,
}: ProductFormHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(productId ? `/product-details/${productId}` : "/products")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">
          {isEditing ? "Ürünü Düzenle" : "Yeni Ürün"}
        </h1>
      </div>
      
      <div className="flex space-x-2">
        {isEditing && (
          <Button variant="outline" onClick={onDuplicate}>
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
  );
};

export default ProductFormHeader;
