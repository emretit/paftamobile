import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface MonthlyFinancial {
  id: string;
  user_id: string;
  year: number;
  month: number;
  category: string;
  subcategory: string | null;
  amount: number;
  target_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMonthlyFinancialData {
  year: number;
  month: number;
  category: string;
  subcategory?: string;
  amount: number;
  target_amount?: number;
  notes?: string;
}

export const useMonthlyFinancials = () => {
  const [financials, setFinancials] = useState<MonthlyFinancial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFinancials = async (year?: number, month?: number) => {
    try {
      console.log('fetchFinancials called with year:', year, 'month:', month);
      setLoading(true);
      setError(null);
      
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Current user:', user?.id, 'Auth error:', authError);
      
      if (authError) {
        console.error('Authentication error:', authError);
        throw authError;
      }
      
      if (!user) {
        console.error('No authenticated user');
        throw new Error('User not authenticated');
      }
      
      let query = supabase
        .from('monthly_financials')
        .select('*')
        .order('year', { ascending: true })
        .order('month', { ascending: true })
        .order('category', { ascending: true });

      if (year) query = query.eq('year', year);
      if (month) query = query.eq('month', month);

      console.log('Executing query...');
      const { data, error } = await query;
      
      console.log('Query result - data:', data, 'error:', error);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      console.log('Setting financials data:', data);
      setFinancials((data || []) as MonthlyFinancial[]);
    } catch (err: any) {
      console.error('fetchFinancials error:', err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch financial data: " + err.message,
      });
    } finally {
      console.log('fetchFinancials completed, setting loading to false');
      setLoading(false);
    }
  };

  const upsertFinancial = async (data: CreateMonthlyFinancialData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const insertData = {
        ...data,
        user_id: user.id,
      };

      const { data: result, error } = await supabase
        .from('monthly_financials')
        .upsert([insertData], { 
          onConflict: 'user_id,year,month,category,subcategory'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setFinancials(prev => {
        const index = prev.findIndex(f => 
          f.user_id === result.user_id && 
          f.year === result.year && 
          f.month === result.month && 
          f.category === result.category && 
          f.subcategory === result.subcategory
        );
        
        if (index >= 0) {
          const newFinancials = [...prev];
          newFinancials[index] = result as MonthlyFinancial;
          return newFinancials;
        } else {
          return [...prev, result as MonthlyFinancial];
        }
      });

      toast({
        title: "Success",
        description: "Financial data updated successfully",
      });
      
      return result;
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update financial data: " + err.message,
      });
      throw err;
    }
  };

  const deleteFinancial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('monthly_financials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setFinancials(prev => prev.filter(f => f.id !== id));
      toast({
        title: "Success",
        description: "Financial data deleted successfully",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete financial data: " + err.message,
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  return {
    financials,
    loading,
    error,
    upsertFinancial,
    deleteFinancial,
    refetch: fetchFinancials,
  };
};