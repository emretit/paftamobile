
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
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
          <FinanceHeader />
          <AccountSummary />

          <Tabs defaultValue="bank-accounts" className="space-y-4">
            <TabsList className="bg-white border border-gray-100">
              <TabsTrigger value="bank-accounts">Banka Hesapları</TabsTrigger>
              <TabsTrigger value="cash-flow">Nakit Akışı</TabsTrigger>
              <TabsTrigger value="financial-instruments">Çek/Senet</TabsTrigger>
              <TabsTrigger value="general-ledger">Genel Muhasebe</TabsTrigger>
              <TabsTrigger value="reports">Raporlar</TabsTrigger>
            </TabsList>

            <TabsContent value="bank-accounts">
              <BankAccounts />
            </TabsContent>

            <TabsContent value="cash-flow">
              <CashFlow />
            </TabsContent>

            <TabsContent value="financial-instruments">
              <FinancialInstruments />
            </TabsContent>

            <TabsContent value="general-ledger">
              <GeneralLedger />
            </TabsContent>

            <TabsContent value="reports">
              <Reports />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Finance;
