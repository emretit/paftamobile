
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@/types/task";
import { getTasks } from "@/services/mockCrmService";

interface UseKanbanTasksProps {
  searchQuery?: string;
  selectedEmployee?: string | null;
  selectedType?: string | null;
}

export const useKanbanTasks = ({ 
  searchQuery, 
  selectedEmployee, 
  selectedType 
}: UseKanbanTasksProps = {}) => {
  const [tasksState, setTasksState] = useState<{
    todo: Task[];
    in_progress: Task[];
    completed: Task[];
    postponed: Task[];
  }>({
    todo: [],
    in_progress: [],
    completed: [],
    postponed: []
  });
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", searchQuery, selectedEmployee, selectedType],
    queryFn: async () => {
      const { data, error } = await getTasks();
      if (error) throw error;
      return data as Task[];
    }
  });
  
  // Filter tasks when data or filters change
  useEffect(() => {
    if (!data) return;
    
    let filteredTasks = [...data];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(query) || 
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    // Apply employee filter
    if (selectedEmployee) {
      filteredTasks = filteredTasks.filter(task => 
        task.assigned_to === selectedEmployee
      );
    }
    
    // Apply type filter
    if (selectedType) {
      filteredTasks = filteredTasks.filter(task => 
        task.type === selectedType || task.related_item_type === selectedType
      );
    }
    
    // Group tasks by status
    const grouped = {
      todo: filteredTasks.filter(task => task.status === 'todo'),
      in_progress: filteredTasks.filter(task => task.status === 'in_progress'),
      completed: filteredTasks.filter(task => task.status === 'completed'),
      postponed: filteredTasks.filter(task => task.status === 'postponed')
    };
    
    setTasksState(grouped);
  }, [data, searchQuery, selectedEmployee, selectedType]);
  
  return {
    tasks: tasksState,
    setTasksState,
    isLoading,
    error
  };
};
