
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus } from "@/types/task";

interface TasksState {
  [key: string]: Task[];
}

export const useKanbanTasks = (
  selectedTaskType: string | null,
  searchQuery: string,
  userId?: string
) => {
  const [tasksState, setTasksState] = useState<TasksState>({
    todo: [],
    in_progress: [],
    completed: [],
    postponed: []
  });
  
  // Fetch tasks from Supabase
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["tasks", selectedTaskType, searchQuery, userId],
    queryFn: async () => {
      let query = supabase.from("tasks").select("*");

      // Filter by task type if specified
      if (selectedTaskType && selectedTaskType !== "all") {
        // Convert the string to a valid TaskType
        const taskType = selectedTaskType === "meeting" || 
                         selectedTaskType === "call" || 
                         selectedTaskType === "email" || 
                         selectedTaskType === "follow_up" || 
                         selectedTaskType === "general" || 
                         selectedTaskType === "opportunity" || 
                         selectedTaskType === "proposal" 
                          ? selectedTaskType 
                          : "general";
                          
        query = query.eq("type", taskType);
      }

      // Filter by search query
      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      // Filter by user if specified
      if (userId) {
        query = query.eq("assignee_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Add empty subtasks array if not present
      return (data as Task[]).map(task => ({
        ...task,
        subtasks: task.subtasks || []
      }));
    }
  });

  // Group tasks by status
  useEffect(() => {
    if (tasks) {
      const grouped = tasks.reduce((acc, task) => {
        const status = task.status;
        if (!acc[status]) {
          acc[status] = [];
        }
        
        // Ensure subtasks exists
        const taskWithSubtasks = {
          ...task,
          subtasks: task.subtasks || []
        };
        
        acc[status].push(taskWithSubtasks);
        return acc;
      }, {} as TasksState);

      // Ensure all status keys exist in the state
      const newState = {
        todo: grouped.todo || [],
        in_progress: grouped.in_progress || [],
        completed: grouped.completed || [],
        postponed: grouped.postponed || []
      };

      setTasksState(newState);
    }
  }, [tasks]);

  return {
    tasks: tasksState,
    isLoading,
    error
  };
};
