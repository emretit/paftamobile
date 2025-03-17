
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Opportunity, OpportunityStatus } from "@/types/crm";
import { toast } from "sonner";
import { useEffect } from "react";
import { Task } from "@/types/task";

interface OpportunityFilters {
  status?: OpportunityStatus | 'all';
  search?: string;
  employeeId?: string;
  customerId?: string;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
}

export const useOpportunities = (filters?: OpportunityFilters) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription for opportunities
  useEffect(() => {
    const channel = supabase
      .channel('opportunities-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'opportunities' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['opportunities'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch opportunities
  const opportunitiesQuery = useQuery({
    queryKey: ['opportunities', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('opportunities')
          .select(`
            *,
            customer:customer_id(id, name),
            employee:employee_id(id, first_name, last_name)
          `);
          
        if (filters) {
          if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
          }
          
          if (filters.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
          }
          
          if (filters.employeeId) {
            query = query.eq('employee_id', filters.employeeId);
          }
          
          if (filters.customerId) {
            query = query.eq('customer_id', filters.customerId);
          }
          
          if (filters.dateRange?.from && filters.dateRange?.to) {
            const fromDate = filters.dateRange.from.toISOString();
            const toDate = filters.dateRange.to.toISOString();
            query = query.gte('created_at', fromDate).lte('created_at', toDate);
          }
        }
        
        const { data, error } = await query;
        
        if (error) throw error;

        // Transform data to match the Opportunity type
        return data.map((item: any) => ({
          ...item,
          customer_name: item.customer?.name || '',
          employee_name: item.employee 
            ? `${item.employee.first_name} ${item.employee.last_name}` 
            : '',
        })) as Opportunity[];
      } catch (error) {
        console.error("Error in useOpportunities:", error);
        toast.error("Fırsatlar yüklenirken bir hata oluştu");
        throw error;
      }
    }
  });

  // Create a new opportunity
  const createOpportunity = useMutation({
    mutationFn: async (opportunity: Partial<Opportunity>) => {
      const { data, error } = await supabase
        .from('opportunities')
        .insert(opportunity)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success("Fırsat başarıyla oluşturuldu");
    },
    onError: (error) => {
      console.error("Error creating opportunity:", error);
      toast.error("Fırsat oluşturulurken bir hata oluştu");
    }
  });

  // Update opportunity status
  const updateOpportunityStatus = useMutation({
    mutationFn: async ({ id, status, generateTask = true }: { 
      id: string; 
      status: OpportunityStatus; 
      generateTask?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('opportunities')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (generateTask) {
        const task = createTaskForStatus(data, status);
        if (task) {
          const { error: taskError } = await supabase
            .from('tasks')
            .insert(task);
          
          if (taskError) throw taskError;
        }
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`Fırsat durumu güncellendi`);
    },
    onError: (error) => {
      console.error("Error updating opportunity status:", error);
      toast.error("Fırsat durumu güncellenirken bir hata oluştu");
    }
  });

  // Update opportunity details
  const updateOpportunity = useMutation({
    mutationFn: async (opportunity: Partial<Opportunity> & { id: string }) => {
      const { id, ...rest } = opportunity;
      const { data, error } = await supabase
        .from('opportunities')
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success("Fırsat başarıyla güncellendi");
    },
    onError: (error) => {
      console.error("Error updating opportunity:", error);
      toast.error("Fırsat güncellenirken bir hata oluştu");
    }
  });

  // Delete opportunity
  const deleteOpportunity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success("Fırsat başarıyla silindi");
    },
    onError: (error) => {
      console.error("Error deleting opportunity:", error);
      toast.error("Fırsat silinirken bir hata oluştu");
    }
  });

  return {
    opportunities: opportunitiesQuery.data || [],
    isLoading: opportunitiesQuery.isLoading,
    error: opportunitiesQuery.error,
    createOpportunity,
    updateOpportunityStatus,
    updateOpportunity,
    deleteOpportunity,
    refetch: opportunitiesQuery.refetch
  };
};

// Helper function to create tasks based on opportunity status
function createTaskForStatus(opportunity: Opportunity, status: OpportunityStatus): Partial<Task> | null {
  const baseTask: Partial<Task> = {
    assignee_id: opportunity.employee_id,
    priority: 'medium',
    type: 'opportunity',
    status: 'todo',
    related_item_id: opportunity.id,
    related_item_title: opportunity.title,
  };

  switch (status) {
    case 'new':
      return {
        ...baseTask,
        title: 'İlk görüşmeyi yap ve ziyaret planla',
        description: `${opportunity.title} fırsatı için ilk görüşme ve saha ziyareti planla`,
      };
    case 'first_contact':
      return {
        ...baseTask,
        title: 'Ziyaret Yap ve Rapor Gir',
        description: `${opportunity.title} fırsatı için saha ziyareti gerçekleştir ve rapor hazırla`,
      };
    case 'site_visit':
      return {
        ...baseTask,
        title: 'Teklif Hazırla',
        description: `${opportunity.title} fırsatı için teklif hazırla`,
      };
    case 'proposal_sent':
      return {
        ...baseTask,
        title: 'Teklif Takibini Yap',
        description: `${opportunity.title} fırsatı için gönderilen teklifin takibini yap`,
      };
    case 'accepted':
      return {
        ...baseTask,
        title: 'Satış Sözleşmesi Hazırla',
        description: `${opportunity.title} fırsatı için satış sözleşmesi hazırla`,
      };
    case 'lost':
      return {
        ...baseTask,
        title: 'Fırsat Kapat ve Kaybetme Nedeni Raporla',
        description: `${opportunity.title} fırsatının kapanış raporunu ve kaybetme nedenini dokümante et`,
      };
    default:
      return null;
  }
}
