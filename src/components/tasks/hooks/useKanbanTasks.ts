
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

      // Add the 'type' property to each task to satisfy the Task interface
      const tasksWithType = data.map((task: any) => ({
        ...task,
        type: task.related_item_type || "general"
      }));
      
      return tasksWithType as Task[];
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
