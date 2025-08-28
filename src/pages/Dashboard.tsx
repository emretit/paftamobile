
import DefaultLayout from "@/components/layouts/DefaultLayout";
import SimpleDashboardCards from "@/components/dashboard/SimpleDashboardCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import ExchangeRateCard from "@/components/dashboard/ExchangeRateCard";
import CashflowOverview from "@/components/cashflow/CashflowOverview";

interface DashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Dashboard = ({ isCollapsed, setIsCollapsed }: DashboardProps) => {
  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Finansal Kontrol Paneli"
      subtitle="İşletmenizin finansal durumunu tek bakışta görün"
    >
      <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in">
        {/* Main Dashboard Cards */}
        <SimpleDashboardCards />

        {/* Secondary Section: Quick Actions & Exchange Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <QuickActions />
          </div>
          <div className="lg:col-span-2">
            <ExchangeRateCard />
          </div>
        </div>

        {/* Cashflow Overview */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="pb-4">
            <h2 className="text-xl font-semibold text-gray-900">Nakit Akış Genel Bakışı</h2>
            <p className="text-gray-600 mt-1">
              Aylık gelir ve gider trendleri
            </p>
          </div>
          <CashflowOverview />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
