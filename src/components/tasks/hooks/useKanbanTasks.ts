
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@/types/task";
import * as mockCrmService from "@/services/mockCrmService";

export const useKanbanTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await mockCrmService.getTasks();
      if (error) throw error;

      // Make sure all tasks have the required 'type' property
      const tasksWithType = data.map((task: any) => ({
        ...task,
        type: task.type || task.related_item_type || "general"
      })) as Task[];
      
      return tasksWithType;
    }
  });
  
  useEffect(() => {
    if (data) {
      setTasks(data);
    }
  }, [data]);
  
  // Group tasks by status for Kanban view
  const groupedTasks = {
    todo: tasks.filter(task => task.status === 'todo'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    completed: tasks.filter(task => task.status === 'completed'),
    postponed: tasks.filter(task => task.status === 'postponed')
  };
  
  return {
    tasks: groupedTasks, 
    isLoading,
    error
  };
};
