
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
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        attachments: Array.isArray(item.attachments) ? item.attachments : [],
        warranty_info: typeof item.warranty_info === 'object' ? item.warranty_info : {}
      }));
    }
  });
};
