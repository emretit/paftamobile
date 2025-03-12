
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/employee";
import { useQueryClient } from "@tanstack/react-query";

export const useEmployeeForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: Partial<Employee>) => {
    setIsSubmitting(true);
    try {
      const employeeData = {
        ...data,
        status: data.status || "aktif",
      };

      const { error, data: newEmployee } = await supabase
        .from("employees")
        .insert(employeeData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Çalışan başarıyla oluşturuldu",
      });

      // Invalidate and refetch employees
      queryClient.invalidateQueries({ queryKey: ['employees'] });

      if (newEmployee?.id) {
        navigate(`/employees/${newEmployee.id}`);
      } else {
        navigate("/employees");
      }
    } catch (error) {
      console.error("Error submitting employee form:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Çalışan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, data: Partial<Employee>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("employees")
        .update({
          ...data,
          status: data.status || "aktif",
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Çalışan bilgileri güncellendi",
      });

      // Invalidate and refetch employees
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      navigate(`/employees/${id}`);
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Çalışan güncellenirken bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
    handleUpdate
  };
};
