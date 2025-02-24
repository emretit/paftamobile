
import { Banknote, CreditCard, Receipt, TrendingUp } from "lucide-react";

const AccountSummary = () => {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Toplam Bakiye</span>
          <Banknote className="h-5 w-5 text-blue-500" />
        </div>
        <p className="text-2xl font-bold text-blue-600">₺350,000</p>
        <span className="text-sm text-gray-500">Tüm Hesaplar</span>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Vadesiz Hesaplar</span>
          <CreditCard className="h-5 w-5 text-green-500" />
        </div>
        <p className="text-2xl font-bold text-green-600">₺125,000</p>
        <span className="text-sm text-gray-500">4 Hesap</span>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Vadeli Hesaplar</span>
          <Receipt className="h-5 w-5 text-purple-500" />
        </div>
        <p className="text-2xl font-bold text-purple-600">₺225,000</p>
        <span className="text-sm text-gray-500">2 Hesap</span>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Kredi Limiti</span>
          <TrendingUp className="h-5 w-5 text-orange-500" />
        </div>
        <p className="text-2xl font-bold text-orange-600">₺500,000</p>
        <span className="text-sm text-gray-500">Toplam Limit</span>
      </div>
    </div>
  );
};

export default AccountSummary;
