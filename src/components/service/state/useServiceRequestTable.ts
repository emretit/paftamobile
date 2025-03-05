
import { useState } from "react";
import { useServiceRequests, ServiceStatus } from "@/hooks/useServiceRequests";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const statusOptions: {value: ServiceStatus, label: string}[] = [
  { value: 'new', label: 'Yeni' },
  { value: 'in_progress', label: 'Devam Ediyor' },
  { value: 'assigned', label: 'Atandı' },
  { value: 'on_hold', label: 'Beklemede' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'cancelled', label: 'İptal Edildi' },
];

export function useServiceRequestTable() {
  const { 
    data: serviceRequests, 
    isLoading, 
    isError, 
    refetch, 
    deleteServiceRequest,
    updateServiceRequest,
    isUpdating
  } = useServiceRequests();
  
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDetailRequest, setSelectedDetailRequest] = useState<any>(null);

  const handleActivitySuccess = () => {
    refetch();
  };

  const handleEditRequest = (request: any) => {
    setSelectedRequestData(request);
    setIsEditModalOpen(true);
  };

  const handleDeleteRequest = (request: any) => {
    setSelectedRequestData(request);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRequestData) {
      deleteServiceRequest(selectedRequestData.id);
      setIsDeleteModalOpen(false);
      setSelectedRequestData(null);
    }
  };

  const handleOpenDetail = (request: any) => {
    setSelectedDetailRequest(request);
    setIsDetailOpen(true);
  };

  const handleViewActivities = (requestId: string) => {
    setSelectedRequest(requestId);
    setIsActivityFormOpen(false);
  };

  const handleAddActivity = (requestId: string) => {
    setSelectedRequest(requestId);
    setIsActivityFormOpen(true);
  };

  const handleStatusChange = (requestId: string, newStatus: ServiceStatus) => {
    const request = serviceRequests?.find(r => r.id === requestId);
    if (!request) return;
    
    if (request.status === newStatus) return;
    
    updateServiceRequest({
      id: requestId,
      updateData: {
        title: request.title,
        priority: request.priority,
        service_type: request.service_type,
        ...(request.location && { location: request.location }),
        ...(request.description && { description: request.description }),
        ...(request.customer_id && { customer_id: request.customer_id }),
        ...(request.equipment_id && { equipment_id: request.equipment_id }),
      },
      newFiles: []
    });
    
    supabase
      .from('service_requests')
      .update({ status: newStatus })
      .eq('id', requestId)
      .then(({ error }) => {
        if (error) {
          console.error('Durum güncellenirken hata oluştu:', error);
          toast.error("Durum güncellenemedi");
        } else {
          toast.success(`Durum "${getStatusText(newStatus)}" olarak güncellendi`);
          refetch();
        }
      });
  };

  const handleDownloadAttachment = async (attachment: any) => {
    if (!attachment.path) return;
    
    const { data, error } = await supabase.storage
      .from('service-attachments')
      .download(attachment.path);
    
    if (error) {
      console.error("Error downloading file:", error);
      return;
    }
    
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', attachment.name);
    
    document.body.appendChild(link);
    link.click();
    
    link.parentNode?.removeChild(link);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'new':
        return 'Yeni';
      case 'cancelled':
        return 'İptal Edildi';
      case 'assigned':
        return 'Atandı';
      case 'on_hold':
        return 'Beklemede';
      default:
        return status;
    }
  };

  return {
    serviceRequests,
    isLoading,
    isError,
    selectedRequest,
    setSelectedRequest,
    isActivityFormOpen,
    setIsActivityFormOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    selectedRequestData,
    setSelectedRequestData,
    isDetailOpen,
    setIsDetailOpen,
    selectedDetailRequest,
    handleActivitySuccess,
    handleEditRequest,
    handleDeleteRequest,
    confirmDelete,
    handleOpenDetail,
    handleViewActivities,
    handleAddActivity,
    handleStatusChange,
    handleDownloadAttachment,
    statusOptions
  };
}
