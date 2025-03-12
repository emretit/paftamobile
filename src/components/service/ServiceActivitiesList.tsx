
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceActivity } from "@/components/service/types/serviceActivity";
import { ActivityCard } from "./detail/activity/ActivityCard";
import { ActivityListStates } from "./detail/activity/ActivityListStates";

interface ServiceActivitiesListProps {
  serviceRequestId: string;
}

export const ServiceActivitiesList: React.FC<ServiceActivitiesListProps> = ({ 
  serviceRequestId 
}) => {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ["service-activities", serviceRequestId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("service_activities")
          .select(`
            *,
            materials_used,
            technician:employee_id (id, first_name, last_name, avatar_url),
            employees:employees(first_name, last_name)
          `)
          .eq("service_request_id", serviceRequestId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        // Type assertion with unknown in between to avoid type error
        return (data || []) as unknown as ServiceActivity[];
      } catch (error) {
        console.error("Error fetching service activities:", error);
        throw error;
      }
    },
  });

  if (isLoading || error || !activities) {
    return <ActivityListStates isLoading={isLoading} error={error} />;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <p className="text-gray-500">No activities recorded for this service request yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
};
