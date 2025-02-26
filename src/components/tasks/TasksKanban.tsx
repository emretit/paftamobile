import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { Clock, CheckCircle2, ListTodo } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TaskColumn from "./TaskColumn";
import { toast } from "sonner";
import type { Task } from "@/types/task";

interface TasksKanbanProps {
  searchQuery: string;
  selectedEmployee: string | null;
  selectedType: string | null;
  onEditTask?: (task: Task) => void;
}

const columns = [
  { id: "todo", title: "Yapılacaklar", icon: ListTodo },
  { id: "in_progress", title: "Devam Ediyor", icon: Clock },
  { id: "completed", title: "Tamamlandı", icon: CheckCircle2 },
];

const TasksKanban = ({ searchQuery, selectedEmployee, selectedType, onEditTask }: TasksKanbanProps) => {
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState<Task[]>([]);

  const { data: fetchedTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Task[];
    }
  });

  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);

  useEffect(() => {
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onError: (error) => {
      toast.error('Failed to update task status');
      console.error('Error updating task status:', error);
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

    const newTasks = Array.from(tasks);
    const task = newTasks.find(t => t.id === draggableId);
    if (task) {
      task.status = destination.droppableId;
      setTasks(newTasks);
    }

    await updateTaskMutation.mutateAsync({
      id: draggableId,
      status: destination.droppableId
    });
  };

  const filterTasks = (status: string) => {
    return tasks.filter(task => {
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesEmployee = !selectedEmployee || 
        task.assignee_id === selectedEmployee;
      
      const matchesType = !selectedType || 
        task.type === selectedType;

      return task.status === status && matchesSearch && matchesEmployee && matchesType;
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col lg:flex-row gap-6">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            id={column.id}
            title={column.title}
            icon={column.icon}
            tasks={filterTasks(column.id)}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default TasksKanban;
