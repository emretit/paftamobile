
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ProductFormSchema } from "../ProductFormSchema";

export const useProductFormActions = (
  isEditing: boolean, 
  productId: string | undefined,
  setIsSubmitting: (value: boolean) => void
) => {
  const navigate = useNavigate();

  const onSubmit = async (values: ProductFormSchema, addAnother = false) => {
    console.log("Product submission started:", { values, isEditing, productId });
    setIsSubmitting(true);
    try {
      // Prepare data by ensuring null values for empty strings in UUID fields
      const preparedData = {
        ...values,
        category_id: values.category_id && values.category_id.trim() !== "" && values.category_id !== "none" ? values.category_id : null,
        supplier_id: values.supplier_id && values.supplier_id.trim() !== "" && values.supplier_id !== "none" ? values.supplier_id : null
      };
      
      console.log("Prepared data for submission:", preparedData);
      
      if (isEditing && productId) {
        const updateData = {
          ...preparedData,
          updated_at: new Date().toISOString()
        };

        console.log("Updating existing product:", updateData);
        const { error } = await supabase
          .from("products")
          .update(updateData)
          .eq("id", productId);

        if (error) {
          console.error("Error updating product:", error);
          let errorMessage = "Ürün güncellenirken bir hata oluştu";
          
          // Provide more specific error message based on the error code
          if (error.code === "23505") {
            errorMessage = "Bu SKU veya barkod değeri zaten kullanılmaktadır";
          } else if (error.code === "23503") {
            errorMessage = "Belirtilen kategori veya tedarikçi bulunamadı";
          }
          
          toast({
            title: "Hata",
            description: errorMessage,
            variant: "destructive"
          });
          throw error;
        }

        toast({
          title: "Başarılı",
          description: "Ürün başarıyla güncellendi",
        });
        navigate(`/product-details/${productId}`);
      } else {
        // Ensure name is not undefined as it's required by the schema
        const insertData = {
          ...preparedData,
          name: preparedData.name, // Explicitly include name to satisfy TypeScript
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log("Creating new product:", insertData);
        const { error, data } = await supabase
          .from("products")
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error("Error saving product:", error);
          let errorMessage = "Ürün kaydedilirken bir hata oluştu";
          
          // Provide more specific error message based on the error code
          if (error.code === "23505") {
            errorMessage = "Bu SKU veya barkod değeri zaten kullanılmaktadır";
          } else if (error.code === "23503") {
            errorMessage = "Belirtilen kategori veya tedarikçi bulunamadı";
          }
          
          toast({
            title: "Hata",
            description: errorMessage,
            variant: "destructive"
          });
          throw error;
        }

        console.log("Product created successfully:", data);
        toast({
          title: "Başarılı",
          description: "Ürün başarıyla oluşturuldu",
        });
        
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
      toast({
        title: "Hata",
        description: "Ürün kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
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

        toast({
          title: "Başarılı",
          description: "Ürün başarıyla kopyalandı",
        });
        if (data) {
          navigate(`/product-form/${data.id}`);
        }
      }
    } catch (error) {
      console.error("Error duplicating product:", error);
      toast({
        title: "Hata",
        description: "Ürün kopyalanırken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    }
  };

  return {
    onSubmit,
    handleDuplicate
  };
};
