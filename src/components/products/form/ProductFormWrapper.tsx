
import { Card } from "@/components/ui/card";
import { useProductForm } from "./hooks/useProductForm";
import { useProductFormActions } from "./hooks/useProductFormActions";
import ProductFormHeader from "./ProductFormHeader";
import ProductFormTabs from "./ProductFormTabs";
import { useEffect } from "react";
import { showError } from "@/utils/toastUtils";

const ProductFormWrapper = () => {
  const { form, isEditing, isSubmitting, setIsSubmitting, productId } = useProductForm();
  const { onSubmit, handleDuplicate } = useProductFormActions(
    isEditing, 
    productId, 
    setIsSubmitting
  );

  // Watch for form errors and display them via toast
  useEffect(() => {
    const subscription = form.watch(() => {
      if (Object.keys(form.formState.errors).length > 0) {
        console.log("Form has errors:", form.formState.errors);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (values: any, addAnother = false) => {
    console.log("Form submission handler called with values:", values);
    try {
      // Validate form before submission
      const isValid = await form.trigger();
      if (!isValid) {
        const errorKeys = Object.keys(form.formState.errors);
        if (errorKeys.length > 0) {
          showError("Lütfen formdaki hataları düzeltin");
          console.error("Form validation errors:", form.formState.errors);
          return { resetForm: false };
        }
      }
      
      const result = await onSubmit(values, addAnother);
      if (result.resetForm) {
        console.log("Resetting form after successful submission");
        form.reset();
      }
      return result;
    } catch (error) {
      console.error("Error in form submission handler:", error);
      return { resetForm: false };
    }
  };

  console.log("Current form state:", { 
    isEditing, 
    productId, 
    isSubmitting, 
    values: form.getValues(),
    errors: form.formState.errors
  });

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
