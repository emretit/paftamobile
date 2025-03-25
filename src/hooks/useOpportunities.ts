
import { useState, useEffect } from 'react';
import { Opportunity } from '@/types/crm';
import { mockCrmService } from '@/services/mockCrm';
import { useToast } from '@/components/ui/use-toast';

export const useOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await mockCrmService.getOpportunities();
      if (error) throw error;
      setOpportunities(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const refreshOpportunities = async () => {
    await fetchOpportunities();
  };

  const addOpportunity = async (opportunity: Partial<Opportunity>): Promise<boolean> => {
    try {
      // In a real app, we would call an API to create the opportunity
      // For now, we'll mock it
      const newId = Math.random().toString(36).substring(2, 11);
      const newOpportunity: Opportunity = {
        id: newId,
        title: opportunity.title || '',
        description: opportunity.description || '',
        status: opportunity.status || 'new',
        priority: opportunity.priority || 'medium',
        value: opportunity.value || 0,
        currency: opportunity.currency || 'TRY',
        customer_id: opportunity.customer_id,
        customer: opportunity.customer,
        assigned_to: opportunity.assigned_to,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: opportunity.tags || [],
        contact_history: []
      };

      // In a real app, we would wait for the API call to complete
      // For now, we'll just add it to the local state
      setOpportunities([...opportunities, newOpportunity]);

      toast({
        title: "Fırsat eklendi",
        description: "Yeni fırsat başarıyla eklendi."
      });

      return true;
    } catch (err) {
      console.error('Error adding opportunity:', err);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Fırsat eklenirken bir hata oluştu."
      });
      return false;
    }
  };

  const updateOpportunity = async (opportunity: Partial<Opportunity> & { id: string }): Promise<boolean> => {
    try {
      const { error } = await mockCrmService.updateOpportunity(
        opportunity.id, 
        opportunity
      );
      
      if (error) throw error;
      
      // Update local state
      setOpportunities(
        opportunities.map(item => 
          item.id === opportunity.id 
            ? { ...item, ...opportunity, updated_at: new Date().toISOString() } 
            : item
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating opportunity:', err);
      return false;
    }
  };

  return {
    opportunities,
    loading,
    error,
    addOpportunity,
    updateOpportunity,
    refreshOpportunities
  };
};
