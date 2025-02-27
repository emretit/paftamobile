
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { 
  Wrench, 
  Clock, 
  MapPin, 
  WrenchIcon, 
  UserCircle2, 
  Tag,  
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'new':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'in_progress':
      return <WrenchIcon className="w-4 h-4" />;
    case 'new':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return null;
  }
};

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
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>Aktiviteler yüklenirken bir hata oluştu.</p>
      </div>
    );
  }

  if (!activities?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <WrenchIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p>Henüz servis aktivitesi kaydedilmemiş.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">
                  {activity.activity_type}
                </CardTitle>
              </div>
              <Badge 
                variant="secondary" 
                className={`${getStatusColor(activity.status)} flex items-center gap-1`}
              >
                {getStatusIcon(activity.status)}
                {activity.status === 'completed' ? 'Tamamlandı' : 
                 activity.status === 'in_progress' ? 'Devam Ediyor' : 
                 activity.status === 'new' ? 'Yeni' : activity.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 whitespace-pre-wrap">{activity.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                {activity.start_time ? format(new Date(activity.start_time), 'dd.MM.yyyy HH:mm') : 'Henüz başlatılmadı'}
              </div>
              <div className="flex items-center text-gray-600">
                <WrenchIcon className="w-4 h-4 mr-2 text-gray-400" />
                {activity.labor_hours ? `${activity.labor_hours} saat` : 'Belirtilmemiş'}
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                {activity.location || 'Belirtilmemiş'}
              </div>
            </div>

            {activity.employees && (
              <div className="flex items-center text-sm text-gray-600 mt-2">
                <UserCircle2 className="w-4 h-4 mr-2 text-gray-400" />
                {activity.employees.first_name} {activity.employees.last_name}
              </div>
            )}

            {activity.materials_used && activity.materials_used.length > 0 && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center text-gray-700">
                  <Tag className="w-4 h-4 mr-2" />
                  Kullanılan Malzemeler:
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {activity.materials_used.map((material, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
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
