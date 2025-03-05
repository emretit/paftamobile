
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTaskRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Task changed:', payload);
          
          // Show a notification based on the event type
          if (payload.eventType === 'INSERT') {
            toast.info('Yeni görev eklendi');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Görev güncellendi');
          } else if (payload.eventType === 'DELETE') {
            toast.info('Görev silindi');
          }
          
          // Invalidate the tasks query to reload the data
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
