import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { TopBar } from "@/components/TopBar";
import { 
  CustomTabs, 
  CustomTabsContent, 
  CustomTabsList, 
  CustomTabsTrigger 
} from "@/components/ui/custom-tabs";
import CashflowOverview from "@/components/cashflow/CashflowOverview";
import AddTransaction from "@/components/cashflow/AddTransaction";
import TransactionsList from "@/components/cashflow/TransactionsList";
import CategoryManagement from "@/components/cashflow/CategoryManagement";
import OpexEntry from "@/components/cashflow/OpexEntry";
import MonthlyFinancialOverview from "@/components/dashboard/MonthlyFinancialOverview";
import { OpexMatrixView } from "@/components/dashboard/OpexMatrixView";
import { TrendingUp, Plus, List, Settings, FileText, BarChart2, Grid } from "lucide-react";

interface CashflowProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Cashflow = ({ isCollapsed, setIsCollapsed }: CashflowProps) => {
  const location = useLocation();
  
  // Determine active tab based on current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/monthly-overview')) return 'monthly-overview';
    if (path.includes('/add-transaction')) return 'add-transaction';
    if (path.includes('/transactions')) return 'transactions';
    if (path.includes('/categories')) return 'categories';
    if (path.includes('/opex-entry')) return 'opex-entry';
    if (path.includes('/opex-matrix')) return 'opex-matrix';
    return 'overview';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <TopBar />
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Nakit Akış Yönetimi</h1>
            <p className="text-gray-600 mt-1">Gelir ve giderlerinizi yönetin</p>
          </div>
          </div>

          <CustomTabs value={getActiveTab()} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
              <CustomTabsList className="w-full h-auto flex flex-wrap gap-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-1 shadow-sm">
                <CustomTabsTrigger value="overview" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
                  <TrendingUp className="h-4 w-4" />
                  <span>Genel Bakış</span>
                </CustomTabsTrigger>
                <CustomTabsTrigger value="monthly-overview" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
                  <BarChart2 className="h-4 w-4" />
                  <span>Aylık Finansal Özet</span>
                </CustomTabsTrigger>
                <CustomTabsTrigger value="add-transaction" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
                  <Plus className="h-4 w-4" />
                  <span>İşlem Ekle</span>
                </CustomTabsTrigger>
                <CustomTabsTrigger value="transactions" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
                  <List className="h-4 w-4" />
                  <span>İşlemler</span>
                </CustomTabsTrigger>
                <CustomTabsTrigger value="categories" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
                  <Settings className="h-4 w-4" />
                  <span>Kategoriler</span>
                </CustomTabsTrigger>
                <CustomTabsTrigger value="opex-entry" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
                  <FileText className="h-4 w-4" />
                  <span>OPEX Girişi</span>
                </CustomTabsTrigger>
                <CustomTabsTrigger value="opex-matrix" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
                  <Grid className="h-4 w-4" />
                  <span>OPEX Matrix</span>
                </CustomTabsTrigger>
              </CustomTabsList>
            </div>

            <CustomTabsContent value="overview" className="mt-6 animate-fade-in">
              <CashflowOverview />
            </CustomTabsContent>

            <CustomTabsContent value="monthly-overview" className="mt-6 animate-fade-in">
              <MonthlyFinancialOverview />
            </CustomTabsContent>

            <CustomTabsContent value="add-transaction" className="mt-6 animate-fade-in">
              <AddTransaction />
            </CustomTabsContent>

            <CustomTabsContent value="transactions" className="mt-6 animate-fade-in">
              <TransactionsList />
            </CustomTabsContent>

            <CustomTabsContent value="categories" className="mt-6 animate-fade-in">
              <CategoryManagement />
            </CustomTabsContent>

            <CustomTabsContent value="opex-entry" className="mt-6 animate-fade-in">
              <OpexEntry />
            </CustomTabsContent>

            <CustomTabsContent value="opex-matrix" className="mt-6 animate-fade-in">
              <OpexMatrixView />
            </CustomTabsContent>
          </CustomTabs>
        </div>
      </main>
    </div>
  );
};

export default Cashflow;