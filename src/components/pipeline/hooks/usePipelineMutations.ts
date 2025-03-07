
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Task } from "@/types/task";
import type { Deal } from "@/types/deal";

export const usePipelineMutations = () => {
  const queryClient = useQueryClient();

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Task['status'] }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-tasks'] });
      toast.success('Task status updated');
    },
    onError: (error) => {
      toast.error('Failed to update task status');
      console.error('Error updating task status:', error);
    }
  });

  const updateDealStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Deal['status'] }) => {
      const { error } = await supabase
        .from('deals')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-deals'] });
      toast.success('Deal status updated');
    },
    onError: (error) => {
      toast.error('Failed to update deal status');
      console.error('Error updating deal status:', error);
    }
  });

  return {
    updateTaskStatusMutation,
    updateDealStatusMutation
  };
};
