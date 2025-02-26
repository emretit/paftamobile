
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
  { id: "todo" as const, title: "Yapılacaklar", icon: ListTodo },
  { id: "in_progress" as const, title: "Devam Ediyor", icon: Clock },
  { id: "completed" as const, title: "Tamamlandı", icon: CheckCircle2 },
] as const;

const TasksKanban = ({ searchQuery, selectedEmployee, selectedType, onEditTask }: TasksKanbanProps) => {
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState<Task[]>([]);

  const { data: fetchedTasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      console.log('Fetching tasks...');
      const { data: tasksData, error } = await supabase
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
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      
      console.log('Fetched tasks:', tasksData);
      
      return tasksData.map(task => ({
        ...task,
        assignee: task.assignee ? {
          id: task.assignee.id,
          name: `${task.assignee.first_name} ${task.assignee.last_name}`,
          avatar: task.assignee.avatar_url
        } : undefined
      })) as Task[];
    }
  });

  useEffect(() => {
    if (fetchedTasks) {
      console.log('Setting tasks:', fetchedTasks);
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
          console.log('Task changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Task['status'] }) => {
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

    const newStatus = destination.droppableId;
    if (newStatus !== 'todo' && newStatus !== 'in_progress' && newStatus !== 'completed') {
      return; // Invalid status
    }

    const newTasks = Array.from(tasks);
    const task = newTasks.find(t => t.id === draggableId);
    if (task) {
      task.status = newStatus;
      setTasks(newTasks);

      await updateTaskMutation.mutateAsync({
        id: draggableId,
        status: newStatus
      });
    }
  };

  const filterTasks = (status: Task['status']) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-red-500">Error loading tasks: {error.message}</div>
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-gray-500">No tasks found. Create your first task!</div>
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
            tasks={filterTasks(column.id)}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default TasksKanban;
