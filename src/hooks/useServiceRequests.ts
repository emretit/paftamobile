
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ServiceRequestAttachment {
  name: string;
  path: string;
  type: string;
  size: number;
}

export type ServicePriority = 'low' | 'medium' | 'high' | 'urgent';
export type ServiceStatus = 'new' | 'in_progress' | 'completed' | 'cancelled' | 'assigned' | 'on_hold';

export interface ServiceRequest {
  id: string;
  title: string;
  description?: string;
  status: ServiceStatus;
  priority: ServicePriority;
  service_type: string;
  attachments: ServiceRequestAttachment[];
  notes?: string[];
  created_at?: string;
  updated_at?: string;
  assigned_to?: string;
  customer_id?: string;
  equipment_id?: string;
  warranty_info?: Record<string, any>;
  location?: string;
  due_date?: string;
}

export interface ServiceRequestFormData {
  title: string;
  description?: string;
  priority: ServicePriority;
  customer_id?: string;
  service_type: string;
  location?: string;
  due_date?: Date;
  equipment_id?: string;
}

export const useServiceRequests = () => {
  const queryClient = useQueryClient();

  // Tüm servis taleplerini getir
  const serviceRequestsQuery = useQuery({
    queryKey: ['service-requests'],
    queryFn: async (): Promise<ServiceRequest[]> => {
      console.log("Fetching service requests...");
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching service requests:", error);
        throw error;
      }
      
      console.log("Service requests data:", data);
      
      return (data || []).map(item => ({
        ...item,
        attachments: Array.isArray(item.attachments) 
          ? item.attachments.map((att: any) => ({
              name: String(att.name || ''),
              path: String(att.path || ''),
              type: String(att.type || ''),
              size: Number(att.size || 0)
            }))
          : [],
        notes: Array.isArray(item.notes) ? item.notes : undefined,
        warranty_info: typeof item.warranty_info === 'object' ? item.warranty_info : undefined
      }));
    },
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });

  // Tek bir servis talebini getir
  const getServiceRequest = async (id: string): Promise<ServiceRequest | null> => {
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching service request:", error);
      return null;
    }

    return {
      ...data,
      attachments: Array.isArray(data.attachments) 
        ? data.attachments.map((att: any) => ({
            name: String(att.name || ''),
            path: String(att.path || ''),
            type: String(att.type || ''),
            size: Number(att.size || 0)
          }))
        : [],
      notes: Array.isArray(data.notes) ? data.notes : undefined,
      warranty_info: typeof data.warranty_info === 'object' ? data.warranty_info : undefined
    };
  };

  // Dosya yükleme fonksiyonu
  const uploadFiles = async (files: File[], serviceRequestId: string) => {
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${serviceRequestId}/${crypto.randomUUID()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('service-attachments')
          .upload(fileName, file);

        if (error) {
          console.error('Dosya yükleme hatası:', error);
          return null;
        }

        return {
          name: file.name,
          path: fileName,
          type: file.type,
          size: file.size,
        };
      })
    );

    return uploadedFiles.filter(Boolean);
  };

  // Servis talebi oluşturma
  const createServiceRequestMutation = useMutation({
    mutationFn: async ({ formData, files }: { formData: ServiceRequestFormData, files: File[] }) => {
      const serviceRequestData = {
        ...formData,
        due_date: formData.due_date?.toISOString(),
        status: 'new' as ServiceStatus,
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
    // Queries
    ...serviceRequestsQuery,
    getServiceRequest,
    
    // Mutations
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
