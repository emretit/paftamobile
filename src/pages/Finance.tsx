
import Navbar from "@/components/Navbar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import FinanceHeader from "@/components/finance/FinanceHeader";
import AccountSummary from "@/components/finance/bank-accounts/AccountSummary";
import GeneralLedger from "@/components/finance/GeneralLedger";
import BankAccounts from "@/components/finance/BankAccounts";
import CashFlow from "@/components/finance/CashFlow";
import Reports from "@/components/finance/Reports";
import FinancialInstruments from "@/components/finance/FinancialInstruments";

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
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
          <FinanceHeader />
          
          {/* Financial Overview Section */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">Finansal Genel Bakış</h2>
            <p className="text-sm text-gray-500">Tüm hesaplarınızın güncel durumu ve özeti</p>
            <AccountSummary />
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="bank-accounts" className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
              <TabsList className="w-full h-auto flex flex-wrap gap-2 bg-transparent">
                <TabsTrigger 
                  value="bank-accounts"
                  className="flex-1 min-w-[150px] data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  Banka Hesapları
                </TabsTrigger>
                <TabsTrigger 
                  value="cash-flow"
                  className="flex-1 min-w-[150px] data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
                >
                  Nakit Akışı
                </TabsTrigger>
                <TabsTrigger 
                  value="financial-instruments"
                  className="flex-1 min-w-[150px] data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
                >
                  Çek/Senet
                </TabsTrigger>
                <TabsTrigger 
                  value="general-ledger"
                  className="flex-1 min-w-[150px] data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
                >
                  Genel Muhasebe
                </TabsTrigger>
                <TabsTrigger 
                  value="reports"
                  className="flex-1 min-w-[150px] data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700"
                >
                  Raporlar
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="bank-accounts" className="mt-6 animate-fade-in">
              <BankAccounts />
            </TabsContent>

            <TabsContent value="cash-flow" className="mt-6 animate-fade-in">
              <CashFlow />
            </TabsContent>

            <TabsContent value="financial-instruments" className="mt-6 animate-fade-in">
              <FinancialInstruments />
            </TabsContent>

            <TabsContent value="general-ledger" className="mt-6 animate-fade-in">
              <GeneralLedger />
            </TabsContent>

            <TabsContent value="reports" className="mt-6 animate-fade-in">
              <Reports />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Finance;
