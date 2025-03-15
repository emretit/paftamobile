
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTaskRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to realtime changes in the tasks table
    const subscription = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
      }, (payload) => {
        console.log('Real-time update:', payload);
        
        // Invalidate the tasks query to refetch data
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        
        // Show toast notification based on the event type
        switch (payload.eventType) {
          case 'INSERT':
            toast.success('Yeni görev eklendi');
            break;
          case 'UPDATE':
            toast.success('Görev güncellendi');
            break;
          case 'DELETE':
            toast.success('Görev silindi');
            break;
        }
      })
      .subscribe();

    // Cleanup subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);
};
