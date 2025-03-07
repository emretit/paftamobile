
import React, { useEffect, useState } from "react";
import { usePipelineItems } from "./hooks/usePipelineItems";
import { filterItems } from "./utils/filterItems";
import { usePipelineMutations } from "./hooks/usePipelineMutations";
import { columns } from "./constants";
import { DealColumn } from "../deals/DealColumn";
import { TaskColumn } from "../tasks/TaskColumn";
import { Deal } from "@/types/deal";
import { Task } from "@/types/task";
import type { PipelineView, ItemType } from "@/types/pipeline";

// Define interfaces for the different item types with employee data
interface DealWithEmployee extends Deal {
  customerName?: string;
  employeeName?: string;
  proposalDate?: string;
  lastContactDate?: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

interface TaskWithAssignee extends Task {
  assignee?: {
    id: string;
    name: string;
    avatar: string;
  };
}

// Create a type for all pipeline items
type PipelineItem = DealWithEmployee | TaskWithAssignee;

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
    tasks, 
    deals, 
    isLoading,
    isError 
  } = usePipelineItems();

  // Process and combine tasks and deals based on the current view
  useEffect(() => {
    if (view === 'deals' && deals) {
      // Process deals data
      const processedDeals = deals.map(deal => {
        // Add item_type to distinguish in the pipeline
        return {
          ...deal,
          item_type: 'deal' as ItemType,
          customerName: deal.customer?.name || 'No Customer',
          employeeName: deal.employee ? 
            `${deal.employee.first_name} ${deal.employee.last_name}` : 
            'Unassigned',
          proposalDate: deal.proposal_date || '',
          lastContactDate: deal.last_contact_date || ''
        } as DealWithEmployee;
      });
      setItems(processedDeals);
    } else if (view === 'tasks' && tasks) {
      // Process tasks data
      const processedTasks = tasks.map(task => {
        return {
          ...task,
          item_type: 'task' as ItemType,
        } as TaskWithAssignee;
      });
      setItems(processedTasks);
    } else if (view === 'unified' && tasks && deals) {
      // Combine both tasks and deals for unified view
      const processedDeals = deals.map(deal => {
        return {
          ...deal,
          item_type: 'deal' as ItemType,
          customerName: deal.customer?.name || 'No Customer',
          employeeName: deal.employee ? 
            `${deal.employee.first_name} ${deal.employee.last_name}` : 
            'Unassigned',
          proposalDate: deal.proposal_date || '',
          lastContactDate: deal.last_contact_date || ''
        } as DealWithEmployee;
      });
      
      const processedTasks = tasks.map(task => {
        return {
          ...task,
          item_type: 'task' as ItemType,
        } as TaskWithAssignee;
      });
      
      setItems([...processedDeals, ...processedTasks]);
    }
  }, [tasks, deals, view]);

  // Filter items based on search term and filters
  const filteredItems = filterItems(items, searchTerm, filters);

  // Update the status of a pipeline item
  const handleUpdateStatus = (id: string, status: string, type: ItemType) => {
    if (type === 'deal') {
      updateDealStatusMutation.mutate({ 
        id, 
        status: status as Deal['status'] 
      });
    } else if (type === 'task') {
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
      {columns.map((column) => (
        <div key={column.id} className="bg-slate-50 rounded-lg p-4">
          <h3 className="font-semibold text-md mb-4">{column.name}</h3>
          
          {filteredItems.filter(item => 
            // For deals
            (item.item_type === 'deal' && item.status === column.id) ||
            // For tasks
            (item.item_type === 'task' && item.status === column.id)
          ).map(item => (
            <div key={`${item.item_type}-${item.id}`} className="mb-2">
              {item.item_type === 'deal' ? (
                <DealColumn 
                  deal={item as DealWithEmployee} 
                  onUpdateStatus={(status) => handleUpdateStatus(item.id, status, 'deal')}
                />
              ) : (
                <TaskColumn
                  task={item as TaskWithAssignee}
                  onUpdateStatus={(status) => handleUpdateStatus(item.id, status, 'task')}
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
