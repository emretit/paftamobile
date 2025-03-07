
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Task } from "@/types/task";

export const usePipelineMutations = () => {
  const queryClient = useQueryClient();
  
  const updateStatus = useMutation({
    mutationFn: async ({ id, status, itemType }: { id: string; status: Task['status']; itemType: Task['item_type'] }) => {
      if (itemType === "task") {
        const { data, error } = await supabase
          .from('tasks')
          .update({ status })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Map task status to deal status
        const dealStatus = 
          status === "todo" ? "new" : 
          status === "in_progress" ? "negotiation" : 
          status === "completed" ? "won" : 
          status === "postponed" ? "lost" : "new";
        
        const { data, error } = await supabase
          .from('deals')
          .update({ status: dealStatus })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      toast.error('Durum güncellenirken bir hata oluştu');
      console.error('Error updating status:', error);
    }
  });
  
  return {
    updateStatus
  };
};
