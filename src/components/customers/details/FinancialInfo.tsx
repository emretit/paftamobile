
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Customer } from "@/types/customer";

interface FinancialInfoProps {
  customer: Customer;
}

export const FinancialInfo = ({ customer }: FinancialInfoProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (balance < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <DollarSign className="w-4 h-4 text-gray-600" />;
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
        Finansal Bilgiler
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {getBalanceIcon(customer.balance)}
            <span className="font-medium">Bakiye</span>
          </div>
          <span className={`font-bold text-lg ${getBalanceColor(customer.balance)}`}>
            {formatCurrency(customer.balance)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="text-green-600 font-medium">Toplam Alacak</div>
            <div className="font-semibold">{formatCurrency(Math.max(0, customer.balance))}</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="text-red-600 font-medium">Toplam Borç</div>
            <div className="font-semibold">{formatCurrency(Math.abs(Math.min(0, customer.balance)))}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
