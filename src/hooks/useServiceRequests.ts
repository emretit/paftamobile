
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ServiceRequestAttachment {
  name: string;
  path: string;
  type: string;
  size: number;
}

interface ServiceRequest {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  service_type: string;
  attachments: ServiceRequestAttachment[];
  notes?: string[];
  created_at?: string;
  updated_at?: string;
  assigned_to?: string;
  customer_id?: string;
  equipment_id?: string;
  warranty_info?: Record<string, any>;
}

export const useServiceRequests = () => {
  return useQuery({
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
    refetchOnWindowFocus: true, // Pencere odağı değiştiğinde yeniden veri çek
    staleTime: 60000, // 1 dakika içindeki veriler güncel kabul edilsin
  });
};
