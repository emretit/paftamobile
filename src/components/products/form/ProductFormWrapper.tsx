
import { Card } from "@/components/ui/card";
import { useProductForm } from "./hooks/useProductForm";
import { useProductFormActions } from "./hooks/useProductFormActions";
import ProductFormHeader from "./ProductFormHeader";
import ProductFormTabs from "./ProductFormTabs";
import { useEffect } from "react";

const ProductFormWrapper = () => {
  const { form, isEditing, isSubmitting, setIsSubmitting, productId } = useProductForm();
  const { onSubmit, handleDuplicate } = useProductFormActions(
    isEditing, 
    productId, 
    setIsSubmitting
  );

  const handleSubmit = async (values, addAnother = false) => {
    const result = await onSubmit(values, addAnother);
    if (result.resetForm) {
      form.reset();
    }
    return result;
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <ProductFormHeader 
          isEditing={isEditing}
          isSubmitting={isSubmitting}
          productId={productId}
          form={form}
          onSubmit={handleSubmit}
          onDuplicate={handleDuplicate}
        />

        <Card className="p-6">
          <ProductFormTabs 
            form={form} 
            onSubmit={handleSubmit} 
          />
        </Card>
      </div>
    </div>
  );
};

export default ProductFormWrapper;
