
import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { Clock, CheckCircle2, ListTodo } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TaskColumn from "../tasks/TaskColumn";
import { toast } from "sonner";
import type { Task } from "@/types/task";
import type { Deal } from "@/types/deal";

interface UnifiedPipelineProps {
  searchQuery?: string;
  selectedEmployee?: string | null;
  selectedType?: string | null;
  onEditTask?: (task: Task) => void;
  onSelectTask?: (task: Task) => void;
  onEditDeal?: (deal: Deal) => void;
  onSelectDeal?: (deal: Deal) => void;
}

const columns = [
  { id: "todo" as const, title: "Yapılacaklar", icon: ListTodo },
  { id: "in_progress" as const, title: "Devam Ediyor", icon: Clock },
  { id: "completed" as const, title: "Tamamlandı", icon: CheckCircle2 },
] as const;

const UnifiedPipeline = ({ 
  searchQuery = "", 
  selectedEmployee, 
  selectedType,
  onEditTask,
  onSelectTask,
  onEditDeal,
  onSelectDeal
}: UnifiedPipelineProps) => {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<Task[]>([]);

  // Fetch both tasks and deals
  const { data: fetchedItems, isLoading, error } = useQuery({
    queryKey: ['unified-pipeline'],
    queryFn: async () => {
      console.log('Fetching unified pipeline items...');
      const [tasksResponse, dealsResponse] = await Promise.all([
        supabase
          .from('tasks')
          .select(`
            *,
            assignee:assignee_id (
              id,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('deals')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (tasksResponse.error) throw tasksResponse.error;
      if (dealsResponse.error) throw dealsResponse.error;

      // Convert deals to task format for unified view
      const dealsAsTasks: Task[] = dealsResponse.data.map(deal => ({
        id: deal.id,
        title: deal.title,
        description: deal.description || "",
        status: deal.status === "new" ? "todo" : 
               deal.status === "negotiation" ? "in_progress" : 
               deal.status === "won" ? "completed" : "todo",
        assignee_id: deal.employee_id,
        due_date: deal.expected_close_date,
        priority: deal.priority,
        type: "opportunity",
        item_type: "opportunity",
        related_item_id: deal.id,
        related_item_title: `${deal.title} (${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(deal.value)})`,
        created_at: deal.created_at,
        updated_at: deal.updated_at
      }));

      const tasks = tasksResponse.data.map(task => ({
        ...task,
        item_type: "task",
        assignee: task.assignee ? {
          id: task.assignee.id,
          name: `${task.assignee.first_name} ${task.assignee.last_name}`,
          avatar: task.assignee.avatar_url
        } : undefined
      }));

      return [...tasks, ...dealsAsTasks];
    }
  });

  useEffect(() => {
    if (fetchedItems) {
      console.log('Setting items:', fetchedItems);
      setItems(fetchedItems);
    }
  }, [fetchedItems]);

  // Set up realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('unified-pipeline-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Task changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['unified-pipeline'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, status, itemType }: { id: string; status: Task['status']; itemType: string }) => {
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
        const dealStatus = status === "todo" ? "new" : 
                         status === "in_progress" ? "negotiation" : 
                         status === "completed" ? "won" : "new";
        
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
    onError: (error) => {
      toast.error('Durum güncellenirken bir hata oluştu');
      console.error('Error updating status:', error);
    }
  });

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as Task['status'];
    if (newStatus !== 'todo' && newStatus !== 'in_progress' && newStatus !== 'completed') {
      return;
    }

    const newItems = Array.from(items);
    const item = newItems.find(t => t.id === draggableId);
    if (item) {
      item.status = newStatus;
      setItems(newItems);

      await updateItemMutation.mutateAsync({
        id: draggableId,
        status: newStatus,
        itemType: item.item_type
      });
    }
  };

  const filterItems = (status: Task['status']) => {
    return items.filter(item => {
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesEmployee = !selectedEmployee || 
        item.assignee_id === selectedEmployee;
      
      const matchesType = !selectedType || 
        item.type === selectedType;

      return item.status === status && matchesSearch && matchesEmployee && matchesType;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-red-500">Hata: {error.message}</div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col lg:flex-row gap-6">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            id={column.id}
            title={column.title}
            icon={column.icon}
            tasks={filterItems(column.id)}
            onEdit={(task) => {
              if (task.item_type === "task") {
                onEditTask?.(task);
              } else {
                onEditDeal?.(task as unknown as Deal);
              }
            }}
            onSelect={(task) => {
              if (task.item_type === "task") {
                onSelectTask?.(task);
              } else {
                onSelectDeal?.(task as unknown as Deal);
              }
            }}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default UnifiedPipeline;
