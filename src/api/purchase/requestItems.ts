
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PurchaseRequestItem, PurchaseRequestItemFormData } from "@/types/purchase";

// Function to fetch purchase request items
export const fetchPurchaseRequestItems = async (requestId: string): Promise<PurchaseRequestItem[]> => {
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

// Function to add purchase request items
export const addPurchaseRequestItems = async (requestId: string, items: PurchaseRequestItemFormData[]) => {
  const itemsWithRequestId = items.map(item => ({
    ...item,
    request_id: requestId,
    estimated_total: (item.quantity || 0) * (item.estimated_unit_price || 0)
  }));

  const { error } = await supabase
    .from("purchase_request_items")
    .insert(itemsWithRequestId);

  if (error) {
    toast.error("Talep öğeleri eklenirken hata oluştu");
    throw error;
  }

  return true;
};

// Function to update purchase request items
export const updatePurchaseRequestItems = async (requestId: string, items: PurchaseRequestItemFormData[]) => {
  // First, delete the existing items
  const { error: deleteError } = await supabase
    .from("purchase_request_items")
    .delete()
    .eq("request_id", requestId);

  if (deleteError) {
    toast.error("Mevcut talep öğeleri silinirken hata oluştu");
    throw deleteError;
  }

  // Then insert the new items
  return addPurchaseRequestItems(requestId, items);
};
