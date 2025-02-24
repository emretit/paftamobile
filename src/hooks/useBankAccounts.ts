
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BankAccount = {
  id: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  branch_name: string | null;
  swift_code: string | null;
  iban: string | null;
  account_type: string;
  currency: 'TRY' | 'USD' | 'EUR' | 'GBP';
  current_balance: number;
  available_balance: number;
  credit_limit: number;
  interest_rate: number | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  last_transaction_date: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
};

export const useBankAccounts = () => {
  return useQuery({
    queryKey: ['bankAccounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bank accounts:', error);
        throw error;
      }

      return data as BankAccount[];
    }
  });
};
