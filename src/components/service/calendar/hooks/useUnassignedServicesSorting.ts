
import { useState, useMemo } from 'react';
import { ServiceRequest } from "@/hooks/useServiceRequests";
import type { SortField, SortDirection } from "@/components/tasks/table/types";

export const useUnassignedServicesSorting = (services: ServiceRequest[]) => {
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  
  // Filter for only new services (with status "new") and apply sorting
  const newServices = useMemo(() => {
    const filtered = services.filter(service => service.status === 'new');
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
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
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          valueA = priorityOrder[a.priority];
          valueB = priorityOrder[b.priority];
          break;
        default:
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
      }
      
      const compareResult = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      return sortDirection === "asc" ? compareResult : -compareResult;
    });
  }, [services, sortField, sortDirection]);

  // Handle sorting when a column header is clicked
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
    newServices,
    sortField,
    sortDirection,
    handleSort
  };
};
