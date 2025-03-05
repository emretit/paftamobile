
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ActivityCard } from "./detail/activity/ActivityCard";
import { 
  ActivityListLoading, 
  ActivityListError, 
  ActivityListEmpty 
} from "./detail/activity/ActivityListStates";
import { ServiceActivity } from "./types/serviceActivity";

interface ServiceActivitiesListProps {
  serviceRequestId: string;
}

export function ServiceActivitiesList({ serviceRequestId }: ServiceActivitiesListProps) {
  const { data: activities, isLoading, isError } = useQuery({
    queryKey: ['service-activities', serviceRequestId],
    queryFn: async () => {
      console.log("Fetching service activities for request:", serviceRequestId);
      
      const { data, error } = await supabase
        .from('service_activities')
        .select(`
          *,
          employees (
            first_name,
            last_name
          )
        `)
        .eq('service_request_id', serviceRequestId)
        .order('start_time', { ascending: false });

      if (error) {
        console.error("Error fetching service activities:", error);
        throw error;
      }
      
      console.log("Service activities data:", data);
      
      const typedData = (data || []).map(item => ({
        ...item,
        materials_used: Array.isArray(item.materials_used) ? item.materials_used.map((m: any) => ({
          name: String(m?.name || ''),
          quantity: Number(m?.quantity || 0),
          unit: String(m?.unit || 'adet')
        })) : []
      })) as ServiceActivity[];
      
      return typedData;
    }
  });

  if (isLoading) {
    return <ActivityListLoading />;
  }

  if (isError) {
    return <ActivityListError />;
  }

  if (!activities?.length) {
    return <ActivityListEmpty />;
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
