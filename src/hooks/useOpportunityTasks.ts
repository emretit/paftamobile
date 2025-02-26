
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Task } from "@/types/task";

interface CreateTaskInput {
  title: string;
  description?: string;
  opportunity_id: string;
  assignee_id?: string;
  due_date?: string;
  priority?: Task['priority'];
}

export const useOpportunityTasks = () => {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            ...input,
            status: 'todo',
            type: 'opportunity',
            item_type: 'task',
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['unified-pipeline'] });
      toast.success('Görev başarıyla oluşturuldu');
    },
    onError: (error) => {
      toast.error('Görev oluşturulurken bir hata oluştu');
      console.error('Error creating task:', error);
    }
  });

  const createAutoTasks = async (opportunityId: string, newStatus: string) => {
    const autoTasks: Partial<CreateTaskInput>[] = [];

    switch (newStatus) {
      case 'negotiation':
        autoTasks.push({
          title: 'Teklif Hazırla',
          description: 'Fırsat için detaylı teklif hazırla',
          priority: 'high'
        });
        autoTasks.push({
          title: 'Takip Görüşmesi Planla',
          description: 'Müşteri ile teklifin detaylarını görüşmek için toplantı planla',
          priority: 'medium'
        });
        break;
      case 'follow_up':
        autoTasks.push({
          title: 'Müşteri Takibi',
          description: 'Müşteri ile iletişime geç ve durumu güncelle',
          priority: 'medium'
        });
        break;
      case 'won':
        autoTasks.push({
          title: 'Sözleşme Hazırla',
          description: 'Kazanılan fırsat için sözleşme hazırla',
          priority: 'high'
        });
        break;
    }

    for (const task of autoTasks) {
      await createTaskMutation.mutateAsync({
        ...task,
        opportunity_id: opportunityId
      } as CreateTaskInput);
    }
  };

  return {
    createTask: createTaskMutation.mutate,
    createAutoTasks
  };
};
