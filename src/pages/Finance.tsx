
import Navbar from "@/components/Navbar";
import FinanceHeader from "@/components/finance/FinanceHeader";
import AccountSummary from "@/components/finance/bank-accounts/AccountSummary";
import GeneralLedger from "@/components/finance/GeneralLedger";
import BankAccounts from "@/components/finance/BankAccounts";
import CashFlow from "@/components/finance/CashFlow";
import Reports from "@/components/finance/Reports";
import FinancialInstruments from "@/components/finance/FinancialInstruments";
import { 
  CustomTabs, 
  CustomTabsContent, 
  CustomTabsList, 
  CustomTabsTrigger 
} from "@/components/ui/custom-tabs";

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

          {/* Ana İçerik Sekmeleri */}
          <CustomTabs defaultValue="bank-accounts" className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
              <CustomTabsList className="w-full h-auto flex flex-wrap gap-2 bg-transparent">
                <CustomTabsTrigger value="bank-accounts" className="flex-1 min-w-[150px]">
                  Banka Hesapları
                </CustomTabsTrigger>
                <CustomTabsTrigger value="cash-flow" className="flex-1 min-w-[150px]">
                  Nakit Akışı
                </CustomTabsTrigger>
                <CustomTabsTrigger value="financial-instruments" className="flex-1 min-w-[150px]">
                  Çek/Senet
                </CustomTabsTrigger>
                <CustomTabsTrigger value="general-ledger" className="flex-1 min-w-[150px]">
                  Genel Muhasebe
                </CustomTabsTrigger>
                <CustomTabsTrigger value="reports" className="flex-1 min-w-[150px]">
                  Raporlar
                </CustomTabsTrigger>
              </CustomTabsList>
            </div>

            <CustomTabsContent value="bank-accounts" className="mt-6 animate-fade-in">
              <AccountSummary />
              <div className="mt-6">
                <BankAccounts />
              </div>
            </CustomTabsContent>

            <CustomTabsContent value="cash-flow" className="mt-6 animate-fade-in">
              <CashFlow />
            </CustomTabsContent>

            <CustomTabsContent value="financial-instruments" className="mt-6 animate-fade-in">
              <FinancialInstruments />
            </CustomTabsContent>

            <CustomTabsContent value="general-ledger" className="mt-6 animate-fade-in">
              <GeneralLedger />
            </CustomTabsContent>

            <CustomTabsContent value="reports" className="mt-6 animate-fade-in">
              <Reports />
            </CustomTabsContent>
          </CustomTabs>
        </div>
      </main>
    </div>
  );
};

export default Finance;
