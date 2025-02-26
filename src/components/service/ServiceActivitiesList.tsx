
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Wrench, Clock, MapPin, WrenchIcon } from "lucide-react";

interface ServiceMaterial {
  name: string;
  quantity: number;
  unit: string;
}

interface ServiceActivity {
  id: string;
  activity_type: string;
  description: string;
  location: string;
  labor_hours: number;
  materials_used: ServiceMaterial[];
  start_time: string;
  status: string;
  performed_by?: string;
  employees?: {
    first_name: string;
    last_name: string;
  };
}

interface ServiceActivitiesListProps {
  serviceRequestId: string;
}

export function ServiceActivitiesList({ serviceRequestId }: ServiceActivitiesListProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['service-activities', serviceRequestId],
    queryFn: async () => {
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

      if (error) throw error;
      
      // Type assertion to handle the JSON column
      const typedData = (data || []).map(item => ({
        ...item,
        materials_used: Array.isArray(item.materials_used) ? item.materials_used.map(m => ({
          name: String(m.name || ''),
          quantity: Number(m.quantity || 0),
          unit: String(m.unit || 'adet')
        })) : []
      })) as ServiceActivity[];
      
      return typedData;
    }
  });

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  if (!activities?.length) {
    return <div>Henüz servis aktivitesi kaydedilmemiş.</div>;
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id}>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Wrench className="w-5 h-5 mr-2" />
              {activity.activity_type}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{activity.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {format(new Date(activity.start_time), 'dd.MM.yyyy HH:mm')}
              </div>
              <div className="flex items-center">
                <WrenchIcon className="w-4 h-4 mr-2" />
                {activity.labor_hours} saat
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {activity.location}
              </div>
            </div>

            {activity.materials_used && activity.materials_used.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Kullanılan Malzemeler:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {activity.materials_used.map((material, index) => (
                    <li key={index}>
                      {material.name} - {material.quantity} {material.unit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
