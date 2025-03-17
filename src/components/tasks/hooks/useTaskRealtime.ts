
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTaskRealtime = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Subscribe to task changes
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          // Invalidate tasks query when data changes
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
      )
      .subscribe();
      
    return () => {
      // Unsubscribe when component unmounts
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  // No return value needed, this hook just sets up the listener
};
