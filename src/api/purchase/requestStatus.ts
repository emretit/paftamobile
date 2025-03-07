
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PurchaseRequestStatus } from "@/types/purchase";

// Function to update purchase request status
export const updateRequestStatus = async ({ 
  id, 
  status, 
  approvedBy = null 
}: { 
  id: string, 
  status: PurchaseRequestStatus, 
  approvedBy?: string | null 
}) => {
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
