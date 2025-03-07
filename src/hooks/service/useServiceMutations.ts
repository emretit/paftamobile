
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ServiceRequestFormData, ServiceMutationsResult } from "./types";
import { useServiceFileUpload } from "./useServiceFileUpload";
import { useServiceQueries } from "./useServiceQueries";

export const useServiceMutations = (): ServiceMutationsResult => {
  const queryClient = useQueryClient();
  const { uploadFiles } = useServiceFileUpload();
  const { getServiceRequest } = useServiceQueries();

  // Servis talebi oluşturma
  const createServiceRequestMutation = useMutation({
    mutationFn: async ({ formData, files }: { formData: ServiceRequestFormData, files: File[] }) => {
      const serviceRequestData = {
        ...formData,
        due_date: formData.due_date?.toISOString(),
        status: 'new' as const,
        attachments: [],
      };

      // Supabase'e gönderilen veriler
      const { data, error } = await supabase
        .from('service_requests')
        .insert(serviceRequestData as any)
        .select()
        .single();

      if (error) throw error;

      if (files.length > 0 && data) {
        const uploadedFiles = await uploadFiles(files, data.id);
        
        // Dosya yüklendikten sonra güncelle, JSON olarak attachments dizisini gönderiyoruz
        const { error: updateError } = await supabase
          .from('service_requests')
          .update({ attachments: uploadedFiles })
          .eq('id', data.id);

        if (updateError) throw updateError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success("Servis talebi başarıyla oluşturuldu");
    },
    onError: (error) => {
      console.error('Servis talebi oluşturma hatası:', error);
      toast.error("Servis talebi oluşturulamadı");
    },
  });

  // Servis talebi güncelleme 
  const updateServiceRequestMutation = useMutation({
    mutationFn: async ({ 
      id, 
      updateData, 
      newFiles = [] 
    }: { 
      id: string; 
      updateData: Partial<ServiceRequestFormData>; 
      newFiles?: File[] 
    }) => {
      // Mevcut servis talebini getir
      const currentRequest = await getServiceRequest(id);
      if (!currentRequest) {
        throw new Error("Servis talebi bulunamadı");
      }

      let updatedAttachments = [...(currentRequest.attachments || [])];

      // Yeni dosyalar varsa yükle
      if (newFiles.length > 0) {
        const uploadedFiles = await uploadFiles(newFiles, id);
        updatedAttachments = [...updatedAttachments, ...uploadedFiles];
      }

      const updatePayload = {
        ...updateData,
        due_date: updateData.due_date ? updateData.due_date.toISOString() : currentRequest.due_date,
        attachments: updatedAttachments as any // any tipini kullanarak TypeScript uyumluluğu sağlıyoruz
      };

      const { data, error } = await supabase
        .from('service_requests')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success("Servis talebi başarıyla güncellendi");
    },
    onError: (error) => {
      console.error('Servis talebi güncelleme hatası:', error);
      toast.error("Servis talebi güncellenemedi");
    },
  });

  // Servis talebi silme
  const deleteServiceRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      // Önce talebe bağlı aktiviteleri sil
      const { error: activitiesError } = await supabase
        .from('service_activities')
        .delete()
        .eq('service_request_id', id);

      if (activitiesError) throw activitiesError;

      // Sonra talebi sil
      const { error } = await supabase
        .from('service_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success("Servis talebi başarıyla silindi");
    },
    onError: (error) => {
      console.error('Servis talebi silme hatası:', error);
      toast.error("Servis talebi silinemedi");
    },
  });

  // Dosya silme 
  const deleteAttachmentMutation = useMutation({
    mutationFn: async ({ requestId, attachmentPath }: { requestId: string, attachmentPath: string }) => {
      // Önce dosyayı storage'dan sil
      const { error: storageError } = await supabase.storage
        .from('service-attachments')
        .remove([attachmentPath]);

      if (storageError) throw storageError;

      // Sonra talepten dosya bilgisini kaldır
      const currentRequest = await getServiceRequest(requestId);
      if (!currentRequest) {
        throw new Error("Servis talebi bulunamadı");
      }

      const updatedAttachments = currentRequest.attachments.filter(att => att.path !== attachmentPath);

      const { data, error } = await supabase
        .from('service_requests')
        .update({ attachments: updatedAttachments as any })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success("Dosya başarıyla silindi");
    },
    onError: (error) => {
      console.error('Dosya silme hatası:', error);
      toast.error("Dosya silinemedi");
    },
  });

  return {
    createServiceRequest: createServiceRequestMutation.mutate,
    isCreating: createServiceRequestMutation.isPending,
    
    updateServiceRequest: updateServiceRequestMutation.mutate,
    isUpdating: updateServiceRequestMutation.isPending,
    
    deleteServiceRequest: deleteServiceRequestMutation.mutate,
    isDeleting: deleteServiceRequestMutation.isPending,
    
    deleteAttachment: deleteAttachmentMutation.mutate,
    isDeletingAttachment: deleteAttachmentMutation.isPending,
  };
};
