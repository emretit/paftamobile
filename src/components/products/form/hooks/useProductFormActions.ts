
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductFormSchema } from "../ProductFormSchema";

export const useProductFormActions = (
  isEditing: boolean, 
  productId: string | undefined,
  setIsSubmitting: (value: boolean) => void
) => {
  const navigate = useNavigate();

  const onSubmit = async (values: ProductFormSchema, addAnother = false) => {
    setIsSubmitting(true);
    try {
      // Prepare data by ensuring null values for empty strings in UUID fields
      const preparedData = {
        ...values,
        category_id: values.category_id && values.category_id.trim() !== "" ? values.category_id : null,
        supplier_id: values.supplier_id && values.supplier_id.trim() !== "" ? values.supplier_id : null
      };
      
      if (isEditing && productId) {
        const updateData = {
          ...preparedData,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from("products")
          .update(updateData)
          .eq("id", productId);

        if (error) throw error;

        toast.success("Ürün başarıyla güncellendi");
        navigate(`/product-details/${productId}`);
      } else {
        // Ensure name is not undefined as it's required by the schema
        const insertData = {
          ...preparedData,
          name: preparedData.name, // Explicitly include name to satisfy TypeScript
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error, data } = await supabase
          .from("products")
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;

        toast.success("Ürün başarıyla oluşturuldu");
        
        if (addAnother) {
          // We'll handle form reset in the component
          return { resetForm: true };
        } else if (data) {
          navigate(`/product-details/${data.id}`);
        }
      }
      return { resetForm: false };
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Ürün kaydedilirken bir hata oluştu");
      return { resetForm: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!productId) return;

    try {
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
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
          .insert(newProduct)
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

  return {
    onSubmit,
    handleDuplicate
  };
};
