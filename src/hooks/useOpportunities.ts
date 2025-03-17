
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DropResult } from "@hello-pangea/dnd";
import { Opportunity, OpportunityStatus } from "@/types/crm";
import { useToast } from "@/components/ui/use-toast";

interface OpportunityState {
  new: Opportunity[];
  first_contact: Opportunity[];
  site_visit: Opportunity[];
  preparing_proposal: Opportunity[];
  proposal_sent: Opportunity[];
  accepted: Opportunity[];
  lost: Opportunity[];
}

export const useOpportunities = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch opportunities
  const { data, isLoading, error } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select(`
          *,
          customer:customer_id (*),
          assigned_to:employee_id (id, first_name, last_name, avatar_url)
        `)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching opportunities:", error);
        throw error;
      }

      // Group by status
      const grouped: OpportunityState = {
        new: [],
        first_contact: [],
        site_visit: [],
        preparing_proposal: [],
        proposal_sent: [],
        accepted: [],
        lost: [],
      };

      data.forEach((opp) => {
        if (grouped[opp.status as keyof OpportunityState]) {
          grouped[opp.status as keyof OpportunityState].push(opp as Opportunity);
        }
      });

      return grouped;
    },
  });

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Get all statuses as an array of keys from the OpportunityState type
    const statuses = Object.keys(data || {}) as OpportunityStatus[];
    
    // Find the opportunity that was dragged
    const opportunity = data?.[source.droppableId as OpportunityStatus]?.find(
      (opp) => opp.id === draggableId
    );

    if (!opportunity) return;

    // Destination status is the droppableId
    const newStatus = destination.droppableId as OpportunityStatus;

    // Update local state optimistically
    const newData = { ...data } as OpportunityState;
    
    // Remove from source
    newData[source.droppableId as OpportunityStatus] = 
      newData[source.droppableId as OpportunityStatus].filter(
        (opp) => opp.id !== draggableId
      );
    
    // Add to destination
    const updatedOpportunity = { ...opportunity, status: newStatus };
    
    newData[newStatus] = [
      ...newData[newStatus].slice(0, destination.index),
      updatedOpportunity,
      ...newData[newStatus].slice(destination.index)
    ];

    // Update opportunity status in database
    try {
      const { error } = await supabase
        .from("opportunities")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", draggableId);

      if (error) throw error;

      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });

      toast({
        title: "Fırsat güncellendi",
        description: "Fırsat durumu başarıyla güncellendi",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      console.error("Error updating opportunity status:", error);
      toast({
        title: "Hata",
        description: "Fırsat durumu güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleUpdateOpportunity = async (opportunity: Partial<Opportunity> & { id: string }) => {
    try {
      const { error } = await supabase
        .from("opportunities")
        .update({
          ...opportunity,
          updated_at: new Date().toISOString()
        })
        .eq("id", opportunity.id);

      if (error) throw error;

      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });

      toast({
        title: "Fırsat güncellendi",
        description: "Fırsat başarıyla güncellendi",
        className: "bg-green-50 border-green-200",
      });

      return true;
    } catch (error) {
      console.error("Error updating opportunity:", error);
      toast({
        title: "Hata",
        description: "Fırsat güncellenirken bir hata oluştu",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    opportunities: data || {
      new: [],
      first_contact: [],
      site_visit: [],
      preparing_proposal: [],
      proposal_sent: [],
      accepted: [],
      lost: [],
    },
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
