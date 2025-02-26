
import type { Task } from "@/types/task";

export const filterItems = (
  items: Task[],
  status: Task['status'],
  searchQuery: string = "",
  selectedEmployee?: string | null,
  selectedType?: string | null
) => {
  return items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesEmployee = !selectedEmployee || 
      item.assignee_id === selectedEmployee;
    
    const matchesType = !selectedType || 
      item.type === selectedType;

    return item.status === status && matchesSearch && matchesEmployee && matchesType;
  });
};
