
import { useState, useEffect } from "react";
import type { Task } from "@/types/task";
import type { SortField, SortDirection } from "./types";

export const useSortedTasks = (
  fetchedTasks: Task[] | undefined,
  searchQuery: string,
  selectedEmployee: string | null,
  selectedType: string | null
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortField, setSortField] = useState<SortField>("due_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    if (fetchedTasks) {
      let filteredTasks = [...fetchedTasks];
      
      // Apply filters
      if (searchQuery) {
        filteredTasks = filteredTasks.filter(task => 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (selectedEmployee) {
        filteredTasks = filteredTasks.filter(task => 
          task.assignee_id === selectedEmployee
        );
      }
      
      if (selectedType) {
        filteredTasks = filteredTasks.filter(task => 
          task.type === selectedType
        );
      }
      
      // Apply sorting
      filteredTasks.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortField) {
          case "title":
            valueA = a.title.toLowerCase();
            valueB = b.title.toLowerCase();
            break;
          case "due_date":
            valueA = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
            valueB = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
            break;
          case "status":
            valueA = a.status;
            valueB = b.status;
            break;
          case "priority":
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            valueA = priorityOrder[a.priority];
            valueB = priorityOrder[b.priority];
            break;
          case "assignee":
            valueA = a.assignee?.name || "";
            valueB = b.assignee?.name || "";
            break;
          default:
            valueA = a.title.toLowerCase();
            valueB = b.title.toLowerCase();
        }
        
        const compareResult = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        return sortDirection === "asc" ? compareResult : -compareResult;
      });
      
      setTasks(filteredTasks);
    }
  }, [fetchedTasks, searchQuery, selectedEmployee, selectedType, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return {
    tasks,
    sortField,
    sortDirection,
    handleSort
  };
};
