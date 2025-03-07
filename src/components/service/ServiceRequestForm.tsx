
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useServiceRequests, ServiceRequestFormData } from "@/hooks/useServiceRequests";
import { useToast } from "@/components/ui/use-toast";
import { 
  TitleField, 
  DescriptionField, 
  PriorityField, 
  ServiceTypeField, 
  LocationField, 
  DueDateField 
} from "./form/FormFields";
import { CustomerField } from "./form/CustomerField";
import { FileUploadField } from "./form/FileUploadField";
import { FormActions } from "./form/FormActions";

// Define the form schema
const formSchema = z.object({
  title: z.string().min(3, { message: "Başlık en az 3 karakter olmalıdır" }),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  service_type: z.string().min(1, { message: "Servis türü seçmelisiniz" }),
  location: z.string().optional(),
  due_date: z.date().optional(),
  customer_id: z.string().optional(),
  equipment_id: z.string().optional(),
});

export interface ServiceRequestFormProps {
  onClose: () => void;
  initialData?: ServiceRequestFormData;
  isEditing?: boolean;
}

export function ServiceRequestForm({ onClose, initialData, isEditing = false }: ServiceRequestFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { createServiceRequest, updateServiceRequest, isCreating, isUpdating } = useServiceRequests();
  const { toast } = useToast();

  const form = useForm<ServiceRequestFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      priority: "medium",
      service_type: "",
      location: "",
      customer_id: undefined,
    },
  });

  // Set form values when initialData changes (for editing)
  useEffect(() => {
    if (initialData && isEditing) {
      Object.keys(initialData).forEach((key) => {
        const value = initialData[key as keyof ServiceRequestFormData];
        if (value !== undefined) {
          if (key === 'due_date' && typeof value === 'string') {
            form.setValue(key as any, new Date(value));
          } else {
            form.setValue(key as any, value);
          }
        }
      });
    }
  }, [initialData, isEditing, form]);

  const onSubmit = (data: ServiceRequestFormData) => {
    if (isEditing && initialData?.id) {
      updateServiceRequest({ 
        id: initialData.id, 
        updateData: data,
        newFiles: files
      });
      toast({
        title: "Servis Talebi Güncellendi",
        description: "Servis talebi başarıyla güncellendi",
      });
    } else {
      createServiceRequest({ formData: data, files });
      toast({
        title: "Servis Talebi Oluşturuldu",
        description: "Servis talebi başarıyla oluşturuldu",
      });
    }
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TitleField form={form} />
        <DescriptionField form={form} />
        <PriorityField form={form} />
        <ServiceTypeField form={form} />
        <CustomerField form={form} />
        <LocationField form={form} />
        <DueDateField form={form} />
        <FileUploadField files={files} setFiles={setFiles} />
        <FormActions 
          onClose={onClose} 
          isSubmitting={isCreating || isUpdating} 
          isEditing={isEditing} 
        />
      </form>
    </Form>
  );
}
