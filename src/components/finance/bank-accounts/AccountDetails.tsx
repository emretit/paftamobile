
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  CreditCard, 
  Calendar,
  Hash,
  BadgeEuro,
  Wallet,
  ArrowUpDown
} from "lucide-react";
import type { BankAccount } from "@/hooks/useBankAccounts";

const AccountDetails = () => {
  const { id } = useParams();

  const { data: account, isLoading } = useQuery({
    queryKey: ['bankAccount', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as BankAccount;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Hesap bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gray-500" />
            {account.bank_name} - {account.account_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Hesap Numarası
              </p>
              <p className="font-medium">{account.account_number || "-"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Şube
              </p>
              <p className="font-medium">{account.branch_name || "-"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                IBAN
              </p>
              <p className="font-medium">{account.iban || "-"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Hesap Türü
              </p>
              <p className="font-medium">{account.account_type}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <BadgeEuro className="h-4 w-4" />
                Para Birimi
              </p>
              <p className="font-medium">{account.currency}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Açılış Tarihi
              </p>
              <p className="font-medium">
                {new Date(account.start_date).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Mevcut Bakiye
                  </p>
                  <p className="text-2xl font-semibold">
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: account.currency
                    }).format(account.current_balance)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Kullanılabilir Bakiye
                  </p>
                  <p className="text-2xl font-semibold">
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: account.currency
                    }).format(account.available_balance)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Kredi Limiti
                  </p>
                  <p className="text-2xl font-semibold">
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: account.currency
                    }).format(account.credit_limit)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountDetails;
