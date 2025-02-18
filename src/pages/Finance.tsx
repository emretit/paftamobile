
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Plus, Wallet } from "lucide-react";

interface FinanceProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Finance = ({ isCollapsed, setIsCollapsed }: FinanceProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                Finans
              </h1>
              <p className="text-gray-600">
                Finansal işlemler ve raporlar
              </p>
            </div>
            <Button className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90">
              <Plus className="h-4 w-4" />
              <span>Yeni İşlem</span>
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 bg-gray-50/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Toplam Gelir</span>
                  <Wallet className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">₺125,000</p>
                <span className="text-sm text-gray-500">Bu ay</span>
              </div>
              
              <div className="p-6 bg-gray-50/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Toplam Gider</span>
                  <Wallet className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-600">₺75,000</p>
                <span className="text-sm text-gray-500">Bu ay</span>
              </div>
              
              <div className="p-6 bg-gray-50/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Net Kar</span>
                  <Wallet className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-600">₺50,000</p>
                <span className="text-sm text-gray-500">Bu ay</span>
              </div>
              
              <div className="p-6 bg-gray-50/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Bekleyen Ödemeler</span>
                  <Wallet className="h-5 w-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-orange-600">₺25,000</p>
                <span className="text-sm text-gray-500">Bu ay</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Son İşlemler</h2>
            <div className="bg-gray-50/50 rounded-lg p-4">
              <p className="text-gray-500 text-center py-8">
                Henüz işlem bulunmuyor
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Finance;
