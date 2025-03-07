
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceRequest, ServiceQueriesResult } from "./types";

export const useServiceQueries = (): ServiceQueriesResult => {
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

  return {
    ...serviceRequestsQuery,
    getServiceRequest,
  };
};
