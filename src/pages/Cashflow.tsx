import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { TopBar } from "@/components/TopBar";
import { 
  CustomTabs, 
  CustomTabsContent, 
  CustomTabsList, 
  CustomTabsTrigger 
} from "@/components/ui/custom-tabs";
import CashflowOverview from "@/components/cashflow/CashflowOverview";
import TransactionsManager from "@/components/cashflow/TransactionsManager";
import CategoryManagement from "@/components/cashflow/CategoryManagement";
import OpexEntry from "@/components/cashflow/OpexEntry";
import EmployeeCosts from "@/components/cashflow/EmployeeCosts";

import { EnhancedCashflowTable } from "@/components/dashboard/EnhancedCashflowTable";
import { TrendingUp, Plus, List, Settings, FileText, BarChart2, Calculator, Users2 } from "lucide-react";

interface CashflowProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Cashflow = ({ isCollapsed, setIsCollapsed }: CashflowProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab based on current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/transactions')) return 'transactions';
    if (path.includes('/categories')) return 'categories';
    if (path.includes('/opex-entry')) return 'opex-entry';
    if (path.includes('/employee-costs')) return 'employee-costs';
    if (path.includes('/main-table')) return 'main-table';
    return 'overview';
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'overview':
        navigate('/cashflow');
        break;
      case 'transactions':
        navigate('/cashflow/transactions');
        break;
      case 'categories':
        navigate('/cashflow/categories');
        break;
      case 'opex-entry':
        navigate('/cashflow/opex-entry');
        break;
      case 'employee-costs':
        navigate('/cashflow/employee-costs');
        break;
      case 'main-table':
        navigate('/cashflow/main-table');
        break;
      default:
        navigate('/cashflow');
    }
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

          <CustomTabs value={getActiveTab()} onValueChange={handleTabChange} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
              <CustomTabsList className="w-full h-auto flex flex-wrap gap-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-1 shadow-sm">
                <CustomTabsTrigger value="overview" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
                  <TrendingUp className="h-4 w-4" />
                  <span>Genel Bakış</span>
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
                <CustomTabsTrigger value="employee-costs" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
                  <Users2 className="h-4 w-4" />
                  <span>Personel Maliyetleri</span>
                </CustomTabsTrigger>
                <CustomTabsTrigger value="main-table" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
                  <Calculator className="h-4 w-4" />
                  <span>Ana Nakit Akış Tablosu</span>
                </CustomTabsTrigger>
              </CustomTabsList>
            </div>

            <CustomTabsContent value="overview" className="mt-6 animate-fade-in">
              <CashflowOverview />
            </CustomTabsContent>


            <CustomTabsContent value="transactions" className="mt-6 animate-fade-in">
              <TransactionsManager />
            </CustomTabsContent>

            <CustomTabsContent value="categories" className="mt-6 animate-fade-in">
              <CategoryManagement />
            </CustomTabsContent>

            <CustomTabsContent value="opex-entry" className="mt-6 animate-fade-in">
              <OpexEntry />
            </CustomTabsContent>

            <CustomTabsContent value="employee-costs" className="mt-6 animate-fade-in">
              <EmployeeCosts />
            </CustomTabsContent>

            <CustomTabsContent value="main-table" className="mt-6 animate-fade-in">
              <EnhancedCashflowTable />
            </CustomTabsContent>
          </CustomTabs>
        </div>
      </main>
    </div>
  );
};

export default Cashflow;