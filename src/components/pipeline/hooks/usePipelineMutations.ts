
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Task } from "@/types/task";

// Helper function to map task status to deal status
const mapTaskStatusToDealStatus = (taskStatus: Task['status']) => {
  switch (taskStatus) {
    case 'todo':
      return 'new';
    case 'in_progress':
      return 'negotiating';
    case 'completed':
      return 'won';
    case 'postponed':
      return 'lost';
    default:
      return 'new';
  }
};

export const usePipelineMutations = () => {
  const queryClient = useQueryClient();
  
  // Update task status
  const updateTaskStatus = useMutation({
    mutationFn: async ({ 
      taskId, 
      status 
    }: { 
      taskId: string; 
      status: Task['status']
    }) => {
      // Update task status
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);
      
      if (taskError) throw taskError;
      
      // Return the task to get its opportunity_id
      const { data: task, error: getTaskError } = await supabase
        .from('tasks')
        .select('opportunity_id')
        .eq('id', taskId)
        .single();
      
      if (getTaskError) throw getTaskError;
      
      // If task is related to an opportunity, update opportunity status
      if (task?.opportunity_id) {
        const dealStatus = mapTaskStatusToDealStatus(status);
        
        const { error: dealError } = await supabase
          .from('opportunities')
          .update({ status: dealStatus })
          .eq('id', task.opportunity_id);
        
        if (dealError) throw dealError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update status');
      console.error('Update status error:', error);
    }
  });
  
  // Add other mutations like create, delete, etc.
  
  return {
    updateTaskStatus,
    // Return other mutations
  };
};
