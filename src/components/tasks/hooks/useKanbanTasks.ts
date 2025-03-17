
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@/types/task";
import * as mockCrmService from "@/services/mockCrmService";

export const useKanbanTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await mockCrmService.mockTasksAPI.getTasks();
      if (error) throw error;
      return data as Task[];
    }
  });
  
  useEffect(() => {
    if (data) {
      setTasks(data);
    }
  }, [data]);
  
  return {
    tasks,
    isLoading,
    error
  };
};
