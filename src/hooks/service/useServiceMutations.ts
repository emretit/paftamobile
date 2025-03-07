
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

  // Create service request
  const createServiceRequestMutation = useMutation({
    mutationFn: async ({ formData, files }: { formData: ServiceRequestFormData, files: File[] }) => {
      const serviceRequestData = {
        ...formData,
        due_date: formData.due_date?.toISOString(),
        status: 'new' as const,
        attachments: [],
      };

      // Submit to Supabase
      const { data, error } = await supabase
        .from('service_requests')
        .insert(serviceRequestData)
        .select()
        .single();

      if (error) throw error;

      if (files.length > 0 && data) {
        const uploadedFiles = await uploadFiles(files, data.id);
        
        // After upload, update with the attachments array
        // Convert to a plain object structure that Supabase can handle
        const attachmentsForDb = uploadedFiles.map(file => ({
          name: file.name,
          path: file.path,
          type: file.type,
          size: file.size
        }));
        
        const { error: updateError } = await supabase
          .from('service_requests')
          .update({ attachments: attachmentsForDb })
          .eq('id', data.id);

        if (updateError) throw updateError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success("Service request created successfully");
    },
    onError: (error) => {
      console.error('Service request creation error:', error);
      toast.error("Failed to create service request");
    },
  });

  // Update service request
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
      // Get current service request
      const currentRequest = await getServiceRequest(id);
      if (!currentRequest) {
        throw new Error("Service request not found");
      }

      let updatedAttachments = [...(currentRequest.attachments || [])];

      // Upload new files if any
      if (newFiles.length > 0) {
        const uploadedFiles = await uploadFiles(newFiles, id);
        updatedAttachments = [...updatedAttachments, ...uploadedFiles];
      }

      // Convert attachments to a plain object structure Supabase can handle
      const attachmentsForDb = updatedAttachments.map(file => ({
        name: file.name,
        path: file.path,
        type: file.type,
        size: file.size
      }));

      const updatePayload = {
        ...updateData,
        due_date: updateData.due_date ? updateData.due_date.toISOString() : currentRequest.due_date,
        attachments: attachmentsForDb
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
      toast.success("Service request updated successfully");
    },
    onError: (error) => {
      console.error('Service request update error:', error);
      toast.error("Failed to update service request");
    },
  });

  // Delete service request
  const deleteServiceRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      // First delete related activities
      const { error: activitiesError } = await supabase
        .from('service_activities')
        .delete()
        .eq('service_request_id', id);

      if (activitiesError) throw activitiesError;

      // Then delete the request
      const { error } = await supabase
        .from('service_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success("Service request deleted successfully");
    },
    onError: (error) => {
      console.error('Service request deletion error:', error);
      toast.error("Failed to delete service request");
    },
  });

  // Delete attachment
  const deleteAttachmentMutation = useMutation({
    mutationFn: async ({ requestId, attachmentPath }: { requestId: string, attachmentPath: string }) => {
      // First delete from storage
      const { error: storageError } = await supabase.storage
        .from('service-attachments')
        .remove([attachmentPath]);

      if (storageError) throw storageError;

      // Then remove attachment info from request
      const currentRequest = await getServiceRequest(requestId);
      if (!currentRequest) {
        throw new Error("Service request not found");
      }

      const updatedAttachments = currentRequest.attachments.filter(att => att.path !== attachmentPath);
      
      // Convert to a plain object structure that Supabase can handle
      const attachmentsForDb = updatedAttachments.map(file => ({
        name: file.name,
        path: file.path,
        type: file.type,
        size: file.size
      }));

      const { data, error } = await supabase
        .from('service_requests')
        .update({ attachments: attachmentsForDb })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success("File deleted successfully");
    },
    onError: (error) => {
      console.error('File deletion error:', error);
      toast.error("Failed to delete file");
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
