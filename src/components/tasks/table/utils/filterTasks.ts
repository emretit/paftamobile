
import { Task } from "@/types/task";

export const filterTasks = (
  tasks: Task[],
  searchQuery: string,
  selectedEmployee: string | null,
  selectedType: string | null
): Task[] => {
  return tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesEmployee = !selectedEmployee || selectedEmployee === "all" || task.assignee_id === selectedEmployee;
    const matchesType = !selectedType || selectedType === "all" || task.type === selectedType;
    
    return matchesSearch && matchesEmployee && matchesType;
  });
};
