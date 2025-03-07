
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PurchaseRequest, PurchaseRequestFormData } from "@/types/purchase";

// Function to fetch purchase requests with filters
export const fetchPurchaseRequests = async (filters: {
  status: string;
  search: string;
  dateRange: { from: Date | null, to: null | Date };
}): Promise<PurchaseRequest[]> => {
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

// Function to fetch a single purchase request by ID
export const fetchPurchaseRequestById = async (id: string): Promise<PurchaseRequest> => {
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

// Function to fetch a request with its items
export const fetchRequestWithItems = async (id: string) => {
  const request = await fetchPurchaseRequestById(id);
  const { fetchPurchaseRequestItems } = await import('./requestItems');
  const items = await fetchPurchaseRequestItems(id);
  return { ...request, items };
};

// Function to create a purchase request
export const createPurchaseRequest = async (requestData: PurchaseRequestFormData) => {
  const { items, ...requestDetails } = requestData;
  
  // Get current user from Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast.error("Kullanıcı kimliği alınamadı");
    throw new Error("User not authenticated");
  }
  
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

  // Import and use the function to add items
  const { addPurchaseRequestItems } = await import('./requestItems');
  await addPurchaseRequestItems(request.id, items);

  toast.success("Satın alma talebi başarıyla oluşturuldu");
  return request;
};

// Function to update a purchase request
export const updatePurchaseRequest = async ({ id, data }: { id: string, data: Partial<PurchaseRequestFormData> }) => {
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
    const { updatePurchaseRequestItems } = await import('./requestItems');
    await updatePurchaseRequestItems(id, items);
  }

  toast.success("Satın alma talebi başarıyla güncellendi");
  return { id };
};

// Function to delete a purchase request
export const deletePurchaseRequest = async (id: string) => {
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
