
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseRequest, PurchaseRequestItem, PurchaseRequestFormData } from "@/types/purchase";
import { toast } from "sonner";

export const usePurchaseRequests = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    dateRange: { from: null, to: null } as { from: Date | null, to: Date | null }
  });

  const fetchPurchaseRequests = async (): Promise<PurchaseRequest[]> => {
    let query = supabase
      .from("purchase_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,request_number.ilike.%${filters.search}%`);
    }

    if (filters.dateRange.from) {
      query = query.gte("created_at", filters.dateRange.from.toISOString());
    }

    if (filters.dateRange.to) {
      query = query.lte("created_at", filters.dateRange.to.toISOString());
    }

    const { data, error } = await query;
    
    if (error) {
      toast.error("Satın alma talepleri yüklenirken hata oluştu");
      throw error;
    }
    
    return data;
  };

  const fetchPurchaseRequestItems = async (requestId: string): Promise<PurchaseRequestItem[]> => {
    const { data, error } = await supabase
      .from("purchase_request_items")
      .select("*")
      .eq("request_id", requestId);

    if (error) {
      toast.error("Talep öğeleri yüklenirken hata oluştu");
      throw error;
    }

    return data;
  };

  const fetchPurchaseRequestById = async (id: string): Promise<PurchaseRequest> => {
    const { data, error } = await supabase
      .from("purchase_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Satın alma talebi yüklenirken hata oluştu");
      throw error;
    }

    return data;
  };

  const createPurchaseRequest = async (requestData: PurchaseRequestFormData) => {
    const { items, ...requestDetails } = requestData;
    
    // Get current user from Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Kullanıcı kimliği alınamadı");
      throw new Error("User not authenticated");
    }
    
    // Start a transaction by using Supabase
    // Create the request first
    const { data: request, error: requestError } = await supabase
      .from("purchase_requests")
      .insert([
        { ...requestDetails, requester_id: user.id }
      ])
      .select()
      .single();

    if (requestError) {
      toast.error("Satın alma talebi oluşturulurken hata oluştu");
      throw requestError;
    }

    // Then create all items
    const itemsWithRequestId = items.map(item => ({
      ...item,
      request_id: request.id,
      estimated_total: (item.quantity || 0) * (item.estimated_unit_price || 0)
    }));

    const { error: itemsError } = await supabase
      .from("purchase_request_items")
      .insert(itemsWithRequestId);

    if (itemsError) {
      toast.error("Talep öğeleri eklenirken hata oluştu");
      throw itemsError;
    }

    toast.success("Satın alma talebi başarıyla oluşturuldu");
    return request;
  };

  const updatePurchaseRequest = async ({ id, data }: { id: string, data: Partial<PurchaseRequestFormData> }) => {
    const { items, ...requestDetails } = data as any;
    
    // Update the request details
    const { error: requestError } = await supabase
      .from("purchase_requests")
      .update(requestDetails)
      .eq("id", id);

    if (requestError) {
      toast.error("Satın alma talebi güncellenirken hata oluştu");
      throw requestError;
    }

    // If items are provided, handle them
    if (items && items.length > 0) {
      // First, delete the existing items
      const { error: deleteError } = await supabase
        .from("purchase_request_items")
        .delete()
        .eq("request_id", id);

      if (deleteError) {
        toast.error("Mevcut talep öğeleri silinirken hata oluştu");
        throw deleteError;
      }

      // Then insert the new items
      const itemsWithRequestId = items.map((item: any) => ({
        ...item,
        request_id: id,
        estimated_total: (item.quantity || 0) * (item.estimated_unit_price || 0)
      }));

      const { error: itemsError } = await supabase
        .from("purchase_request_items")
        .insert(itemsWithRequestId);

      if (itemsError) {
        toast.error("Talep öğeleri eklenirken hata oluştu");
        throw itemsError;
      }
    }

    toast.success("Satın alma talebi başarıyla güncellendi");
    return { id };
  };

  const updateRequestStatus = async ({ id, status, approvedBy = null }: { id: string, status: string, approvedBy?: string | null }) => {
    const updateData: any = { status };
    
    // If the status is 'approved', set the approved_by and approved_at fields
    if (status === 'approved') {
      updateData.approved_by = approvedBy;
      updateData.approved_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from("purchase_requests")
      .update(updateData)
      .eq("id", id);

    if (error) {
      toast.error("Satın alma talebi durumu güncellenirken hata oluştu");
      throw error;
    }

    toast.success("Talep durumu başarıyla güncellendi");
    return { id };
  };

  const deletePurchaseRequest = async (id: string) => {
    // Delete the request (cascade will delete items)
    const { error } = await supabase
      .from("purchase_requests")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Satın alma talebi silinirken hata oluştu");
      throw error;
    }

    toast.success("Satın alma talebi başarıyla silindi");
    return { id };
  };

  const { data: requests, isLoading, error, refetch } = useQuery({
    queryKey: ['purchaseRequests', filters],
    queryFn: fetchPurchaseRequests,
  });

  const fetchRequestWithItems = async (id: string) => {
    const request = await fetchPurchaseRequestById(id);
    const items = await fetchPurchaseRequestItems(id);
    return { ...request, items };
  };

  const getRequestWithItems = (id: string) => {
    return useQuery({
      queryKey: ['purchaseRequest', id],
      queryFn: () => fetchRequestWithItems(id),
    });
  };

  const createRequestMutation = useMutation({
    mutationFn: createPurchaseRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: updatePurchaseRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateRequestStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: deletePurchaseRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    },
  });

  return {
    requests,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
    getRequestWithItems,
    createRequestMutation,
    updateRequestMutation,
    updateStatusMutation,
    deleteRequestMutation,
  };
};
