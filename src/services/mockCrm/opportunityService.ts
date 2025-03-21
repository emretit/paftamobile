
import { supabase } from '@/integrations/supabase/client';
import { Opportunity, ContactHistoryItem } from '@/types/crm';

// Type alias for JSON compatibility with Supabase
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export const mockCrmOpportunityService = {
  updateOpportunity: async (id: string, updateData: Partial<Opportunity>) => {
    try {
      // Need to handle contact_history specifically to convert to JSON
      const dataToUpdate: any = { ...updateData };
      
      // Handle contact_history conversion if present
      if (updateData.contact_history) {
        dataToUpdate.contact_history = JSON.stringify(updateData.contact_history);
      }
      
      const { data, error } = await supabase
        .from('opportunities')
        .update(dataToUpdate)
        .eq('id', id)
        .select(`
          *,
          customer:customer_id (*),
          employee:employee_id (*)
        `)
        .single();

      if (error) throw error;
      
      // Properly cast the returned data
      const opportunity = {
        ...data,
        contact_history: Array.isArray(data.contact_history) 
          ? data.contact_history as unknown as ContactHistoryItem[]
          : []
      } as unknown as Opportunity;
      
      return { data: opportunity, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};
