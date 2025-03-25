
import { useState } from "react";
import { DropResult } from "@hello-pangea/dnd";
import { Opportunity, OpportunityStatus } from "@/types/crm";
import { crmService } from "@/services/crmService";
import { toast } from "sonner";

export const useOpportunities = () => {
  // This is a simplified implementation
  const [opportunities, setOpportunities] = useState<{
    new: Opportunity[];
    first_contact: Opportunity[];
    site_visit: Opportunity[];
    preparing_proposal: Opportunity[];
    proposal_sent: Opportunity[];
    accepted: Opportunity[];
    lost: Opportunity[];
  }>({
    new: [],
    first_contact: [],
    site_visit: [],
    preparing_proposal: [],
    proposal_sent: [],
    accepted: [],
    lost: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    // Find the opportunity that was dragged
    const sourceColumn = opportunities[source.droppableId as OpportunityStatus];
    const draggedOpportunity = sourceColumn.find(o => o.id === draggableId);
    
    if (!draggedOpportunity) return;
    
    // Create new opportunity with updated status
    const updatedOpportunity = {
      ...draggedOpportunity,
      status: destination.droppableId as OpportunityStatus
    };
    
    try {
      // Update locally first for better UX
      setOpportunities(prev => {
        // Remove from source
        const newSourceColumn = prev[source.droppableId as OpportunityStatus].filter(
          o => o.id !== draggableId
        );
        
        // Add to destination
        const newDestColumn = [
          ...prev[destination.droppableId as OpportunityStatus],
          updatedOpportunity
        ];
        
        return {
          ...prev,
          [source.droppableId]: newSourceColumn,
          [destination.droppableId]: newDestColumn
        };
      });
      
      // Then update in the backend
      await crmService.updateOpportunity(draggableId, {
        status: destination.droppableId as OpportunityStatus
      });
      
    } catch (error) {
      console.error("Error updating opportunity status:", error);
      toast.error("Status güncellenirken bir hata oluştu");
      // Revert the change on error
      // Code to revert would go here
    }
  };

  const handleUpdateOpportunity = async (opportunity: Opportunity) => {
    try {
      const result = await crmService.updateOpportunity(opportunity.id, opportunity);
      
      if (result.error) {
        throw result.error;
      }
      
      // Update the opportunity in the local state
      setOpportunities(prev => {
        const status = opportunity.status;
        const updatedColumn = prev[status].map(o => 
          o.id === opportunity.id ? opportunity : o
        );
        
        return {
          ...prev,
          [status]: updatedColumn
        };
      });
      
      setSelectedOpportunity(opportunity);
      toast.success("Fırsat başarıyla güncellendi");
      
    } catch (error) {
      console.error("Error updating opportunity:", error);
      toast.error("Fırsat güncellenirken bir hata oluştu");
    }
  };

  return {
    opportunities,
    isLoading,
    error,
    handleDragEnd,
    handleUpdateOpportunity,
    selectedOpportunity,
    setSelectedOpportunity,
    isDetailOpen,
    setIsDetailOpen
  };
};
