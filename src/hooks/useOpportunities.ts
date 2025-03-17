
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DropResult } from "@hello-pangea/dnd";
import { Opportunity, OpportunityStatus, OpportunityExtended } from "@/types/crm";
import { createTaskForOpportunity } from "@/services/crmWorkflowService";
import { crmSupabase as supabase, mockOpportunitiesAPI } from "@/services/mockCrmService";

interface OpportunitiesState {
  [key: string]: OpportunityExtended[];
}

export const useOpportunities = (
  searchQuery?: string,
  selectedEmployee?: string | null,
  selectedCustomer?: string | null
) => {
  const [opportunities, setOpportunities] = useState<OpportunitiesState>({
    new: [],
    first_contact: [],
    site_visit: [],
    preparing_proposal: [],
    proposal_sent: [],
    accepted: [],
    lost: []
  });
  
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityExtended | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<OpportunityExtended[]>([]);
  
  const queryClient = useQueryClient();
  
  // Fetch opportunities
  const { data, isLoading, error } = useQuery({
    queryKey: ["opportunities", searchQuery, selectedEmployee, selectedCustomer],
    queryFn: async () => {
      let filteredData;

      if (searchQuery || selectedEmployee || selectedCustomer) {
        filteredData = await mockOpportunitiesAPI.filterOpportunities(
          searchQuery || '',
          selectedEmployee || undefined,
          selectedCustomer || undefined
        );
      } else {
        filteredData = await mockOpportunitiesAPI.getOpportunities();
      }
      
      if (filteredData.error) throw filteredData.error;
      return filteredData.data as OpportunityExtended[];
    }
  });
  
  // Organize opportunities by status
  useEffect(() => {
    if (data) {
      const grouped = data.reduce((acc, opportunity) => {
        const status = opportunity.status;
        if (!acc[status]) {
          acc[status] = [];
        }
        acc[status].push(opportunity);
        return acc;
      }, {} as OpportunitiesState);
      
      // Ensure all statuses exist in the state
      const newState = {
        new: grouped.new || [],
        first_contact: grouped.first_contact || [],
        site_visit: grouped.site_visit || [],
        preparing_proposal: grouped.preparing_proposal || [],
        proposal_sent: grouped.proposal_sent || [],
        accepted: grouped.accepted || [],
        lost: grouped.lost || []
      };
      
      setOpportunities(newState);
    }
  }, [data]);
  
  // Handle drag and drop
  const updateOpportunityMutation = useMutation({
    mutationFn: async ({ id, status, previousStatus }: { id: string; status: OpportunityStatus; previousStatus: OpportunityStatus }) => {
      const { data, error } = await mockOpportunitiesAPI.updateOpportunity(id, { status });
      
      if (error) throw error;
      
      return { data, previousStatus };
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      
      const opportunity = result.data as OpportunityExtended;
      
      // Generate task based on the new status
      await createTaskForOpportunity(
        opportunity.id,
        opportunity.title,
        opportunity.status,
        opportunity.employee_id
      );
      
      toast.success('Fırsat durumu güncellendi');
    },
    onError: (error, variables) => {
      toast.error('Fırsat güncellenirken bir hata oluştu');
      console.error('Error updating opportunity:', error);
      
      // Revert the local state to maintain UI consistency
      setOpportunities(prev => {
        const item = prev[variables.status].find(o => o.id === variables.id);
        if (item) {
          // Remove from current column
          const updatedCurrentColumn = prev[variables.status].filter(o => o.id !== variables.id);
          
          // Add back to the original column
          return {
            ...prev,
            [variables.status]: updatedCurrentColumn,
            [variables.previousStatus]: [...prev[variables.previousStatus], {...item, status: variables.previousStatus}]
          };
        }
        return prev;
      });
    }
  });
  
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    // Only process if the destination is a valid status
    if (!Object.keys(opportunities).includes(destination.droppableId)) {
      return;
    }
    
    const sourceStatus = source.droppableId as OpportunityStatus;
    const destinationStatus = destination.droppableId as OpportunityStatus;
    
    // Find the item being moved
    const item = opportunities[sourceStatus].find(o => o.id === draggableId);
    
    if (!item) return;
    
    // Create a copy of the state
    const newState = { ...opportunities };
    
    // Remove item from source column
    newState[sourceStatus] = newState[sourceStatus].filter(o => o.id !== draggableId);
    
    // Add item to destination column with updated status
    const updatedItem = { ...item, status: destinationStatus };
    newState[destinationStatus] = [...newState[destinationStatus], updatedItem];
    
    // Update local state for immediate feedback
    setOpportunities(newState);
    
    // Update in the database
    updateOpportunityMutation.mutate({
      id: draggableId,
      status: destinationStatus,
      previousStatus: sourceStatus
    });
  };
  
  const handleSelectOpportunity = (opportunity: OpportunityExtended) => {
    setSelectedOpportunity(opportunity);
    setIsDetailOpen(true);
  };
  
  const handleSelectItem = (opportunity: OpportunityExtended) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(o => o.id === opportunity.id);
      if (isSelected) {
        return prev.filter(o => o.id !== opportunity.id);
      }
      return [...prev, opportunity];
    });
  };
  
  const handleBulkStatusUpdate = (opportunities: OpportunityExtended[], newStatus: OpportunityStatus) => {
    // First update the UI
    setOpportunities(prev => {
      const newState = { ...prev };
      
      opportunities.forEach(opportunity => {
        const oldStatus = opportunity.status;
        
        // Remove from current column
        newState[oldStatus] = newState[oldStatus].filter(o => o.id !== opportunity.id);
        
        // Add to the new column with updated status
        newState[newStatus] = [...newState[newStatus], { ...opportunity, status: newStatus }];
      });
      
      return newState;
    });
    
    // Then update in the database (in sequence to avoid race conditions)
    const updateSequentially = async () => {
      for (const opportunity of opportunities) {
        try {
          const { error } = await mockOpportunitiesAPI.updateOpportunity(opportunity.id, { status: newStatus });
            
          if (error) throw error;
          
          // Generate task based on the new status
          await createTaskForOpportunity(
            opportunity.id,
            opportunity.title,
            newStatus,
            opportunity.employee_id
          );
        } catch (error) {
          console.error('Error updating opportunity:', error);
          toast.error(`Fırsat güncellenirken bir hata oluştu: ${opportunity.title}`);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Seçili fırsatlar güncellendi');
    };
    
    updateSequentially();
    setSelectedItems([]);
  };
  
  return {
    opportunities,
    isLoading,
    error,
    selectedOpportunity,
    isDetailOpen,
    selectedItems,
    handleDragEnd,
    handleSelectOpportunity,
    handleSelectItem,
    handleBulkStatusUpdate,
    setIsDetailOpen,
    setSelectedItems
  };
};
