import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface CashflowMainItem {
  id: string;
  user_id: string;
  year: number;
  month: number;
  main_category: string;
  subcategory: string;
  value: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const useCashflowMain = () => {
  const [data, setData] = useState<CashflowMainItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCashflowMain = async (year?: number) => {
    try {
      setLoading(true);
      setError(null);

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Kullanıcı kimliği doğrulanmadı');

      let query = supabase
        .from('cashflow_main')
        .select('*')
        .eq('user_id', user.id)
        .order('main_category')
        .order('subcategory')
        .order('month');

      if (year) {
        query = query.eq('year', year);
      }

      const { data: result, error } = await query;
      if (error) throw error;

      setData(result || []);
    } catch (err: any) {
      console.error('fetchCashflowMain error:', err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Nakit akış verileri alınırken hata oluştu: " + err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const upsertCashflowMain = async (
    year: number,
    month: number,
    main_category: string,
    subcategory: string,
    value: number,
    description?: string
  ) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Kullanıcı kimliği doğrulanmadı');

      const { data, error } = await supabase
        .from('cashflow_main')
        .upsert({
          user_id: user.id,
          year,
          month,
          main_category,
          subcategory,
          value,
          description,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setData(prev => {
        const exists = prev.find(item => 
          item.year === year && 
          item.month === month && 
          item.main_category === main_category &&
          item.subcategory === subcategory
        );

        if (exists) {
          return prev.map(item => 
            item.id === exists.id ? data : item
          );
        } else {
          return [...prev, data];
        }
      });

      return data;
    } catch (err: any) {
      console.error('upsertCashflowMain error:', err);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Nakit akış verisi güncellenirken hata oluştu: " + err.message,
      });
      throw err;
    }
  };

  const deleteCashflowMain = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cashflow_main')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setData(prev => prev.filter(item => item.id !== id));

      toast({
        title: "Başarılı",
        description: "Nakit akış verisi silindi.",
      });
    } catch (err: any) {
      console.error('deleteCashflowMain error:', err);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Nakit akış verisi silinirken hata oluştu: " + err.message,
      });
      throw err;
    }
  };

  const refetch = (year?: number) => {
    return fetchCashflowMain(year);
  };

  useEffect(() => {
    fetchCashflowMain(new Date().getFullYear());
  }, []);

  return {
    data,
    loading,
    error,
    upsertCashflowMain,
    deleteCashflowMain,
    refetch,
  };
};