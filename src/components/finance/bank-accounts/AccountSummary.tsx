
import { Banknote, CreditCard, Receipt, TrendingUp } from "lucide-react";
import { useBankAccounts } from "@/hooks/useBankAccounts";

const AccountSummary = () => {
  const { data: accounts } = useBankAccounts();

  const totalBalance = accounts?.reduce((sum, account) => {
    // Convert all amounts to TRY for total (simplified conversion)
    const rate = account.currency === 'TRY' ? 1 : 
                 account.currency === 'USD' ? 30.5 : 
                 account.currency === 'EUR' ? 33.5 : 
                 account.currency === 'GBP' ? 39.0 : 1;
    return sum + (account.current_balance * rate);
  }, 0) ?? 0;

  const checkingAccounts = accounts?.filter(a => a.account_type === 'vadesiz') ?? [];
  const savingsAccounts = accounts?.filter(a => a.account_type === 'vadeli') ?? [];
  const totalCreditLimit = accounts?.reduce((sum, account) => sum + account.credit_limit, 0) ?? 0;

  const checkingTotal = checkingAccounts.reduce((sum, account) => {
    const rate = account.currency === 'TRY' ? 1 : 
                 account.currency === 'USD' ? 30.5 : 
                 account.currency === 'EUR' ? 33.5 : 
                 account.currency === 'GBP' ? 39.0 : 1;
    return sum + (account.current_balance * rate);
  }, 0);

  const savingsTotal = savingsAccounts.reduce((sum, account) => {
    const rate = account.currency === 'TRY' ? 1 : 
                 account.currency === 'USD' ? 30.5 : 
                 account.currency === 'EUR' ? 33.5 : 
                 account.currency === 'GBP' ? 39.0 : 1;
    return sum + (account.current_balance * rate);
  }, 0);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Toplam Bakiye</span>
          <Banknote className="h-5 w-5 text-blue-500" />
        </div>
        <p className="text-2xl font-bold text-blue-600">
          {new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
          }).format(totalBalance)}
        </p>
        <span className="text-sm text-gray-500">{accounts?.length ?? 0} Hesap</span>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Vadesiz Hesaplar</span>
          <CreditCard className="h-5 w-5 text-green-500" />
        </div>
        <p className="text-2xl font-bold text-green-600">
          {new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
          }).format(checkingTotal)}
        </p>
        <span className="text-sm text-gray-500">{checkingAccounts.length} Hesap</span>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Vadeli Hesaplar</span>
          <Receipt className="h-5 w-5 text-purple-500" />
        </div>
        <p className="text-2xl font-bold text-purple-600">
          {new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
          }).format(savingsTotal)}
        </p>
        <span className="text-sm text-gray-500">{savingsAccounts.length} Hesap</span>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Kredi Limiti</span>
          <TrendingUp className="h-5 w-5 text-orange-500" />
        </div>
        <p className="text-2xl font-bold text-orange-600">
          {new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
          }).format(totalCreditLimit)}
        </p>
        <span className="text-sm text-gray-500">Toplam Limit</span>
      </div>
    </div>
  );
};

export default AccountSummary;
