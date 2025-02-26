
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

interface RawServiceRequest {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  attachments: Array<{
    name: string;
    path: string;
    type: string;
    size: number;
  }> | null;
  notes?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  assigned_to?: string | null;
  customer_id?: string | null;
  equipment_id?: string | null;
  warranty_info?: Record<string, any> | null;
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
      
      return (data as RawServiceRequest[] || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || undefined,
        status: item.status,
        priority: item.priority,
        attachments: item.attachments?.map(att => ({
          name: att.name,
          path: att.path,
          type: att.type,
          size: att.size
        })) || [],
        notes: item.notes || undefined,
        created_at: item.created_at || undefined,
        updated_at: item.updated_at || undefined,
        assigned_to: item.assigned_to || undefined,
        customer_id: item.customer_id || undefined,
        equipment_id: item.equipment_id || undefined,
        warranty_info: item.warranty_info || undefined
      }));
    }
  });
};
