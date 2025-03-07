
import React, { useEffect, useState } from "react";
import { usePipelineItems } from "./hooks/usePipelineItems";
import { filterItems } from "./utils/filterItems";
import { usePipelineMutations } from "./hooks/usePipelineMutations";
import DealCard from "../deals/DealCard";
import TaskCard from "../tasks/TaskCard";
import { Deal } from "@/types/deal";
import { Task } from "@/types/task";
import type { PipelineView, ItemType, PipelineColumn, PipelineItem, PipelineDeal } from "@/types/pipeline";

// Define columns for the pipeline
const pipelineColumns: PipelineColumn[] = [
  { id: "todo", name: "To Do" },
  { id: "in_progress", name: "In Progress" },
  { id: "completed", name: "Completed" },
  { id: "postponed", name: "Postponed" },
];

interface UnifiedPipelineProps {
  view: PipelineView;
  searchTerm: string;
  filters: {
    employeeId?: string;
    customerName?: string;
    status?: string[];
    priority?: string[];
  };
}

export const UnifiedPipeline = ({ 
  view,
  searchTerm, 
  filters 
}: UnifiedPipelineProps) => {
  const [items, setItems] = useState<PipelineItem[]>([]);
  const { updateTaskStatusMutation, updateDealStatusMutation } = usePipelineMutations();
  const { 
    items: pipelineItems, 
    isLoading,
    error
  } = usePipelineItems();

  const isError = !!error;

  // Process and combine tasks and deals based on the current view
  useEffect(() => {
    if (pipelineItems) {
      // Filter based on view type
      const filteredItems = pipelineItems.filter(item => {
        if (view === 'tasks') return 'type' in item; // Task has 'type' property
        if (view === 'deals') return 'value' in item; // Deal has 'value' property
        return true; // unified view shows all
      });
      
      setItems(filteredItems);
    }
  }, [pipelineItems, view]);

  // Filter items based on search term and filters
  const filteredItems = filterItems(items, searchTerm, filters);

  // Update the status of a pipeline item
  const handleUpdateStatus = (id: string, status: string, itemType: ItemType) => {
    if (itemType === 'deal') {
      updateDealStatusMutation.mutate({ 
        id, 
        status: status as Deal['status'] 
      });
    } else {
      updateTaskStatusMutation.mutate({ 
        id, 
        status: status as Task['status'] 
      });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading pipeline items...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-600">Error loading pipeline data. Please try again.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {pipelineColumns.map((column) => (
        <div key={column.id} className="bg-slate-50 rounded-lg p-4">
          <h3 className="font-semibold text-md mb-4">{column.name}</h3>
          
          {filteredItems.filter(item => item.status === column.id).map(item => (
            <div key={`${item.id}`} className="mb-2">
              {/* Check if item is a Deal by looking for the value property */}
              {'value' in item ? (
                <DealCard 
                  deal={item as Deal}
                  onClick={() => {}}
                  onSelect={() => {}}
                  isSelected={false}
                />
              ) : (
                <TaskCard
                  task={item as Task}
                  onEdit={() => {}}
                  onSelect={() => {}}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default UnifiedPipeline;
