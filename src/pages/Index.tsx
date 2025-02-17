
import { Users, DollarSign, Target, Award } from "lucide-react";
import DashboardCard from "@/components/DashboardCard";
import DashboardChart from "@/components/DashboardChart";
import DashboardBarChart from "@/components/DashboardBarChart";
import SalesPerformance from "@/components/dashboard/SalesPerformance";
import Navbar from "@/components/Navbar";

interface IndexProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Index = ({ isCollapsed, setIsCollapsed }: IndexProps) => {
  return (
    <div className="min-h-screen bg-white flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 p-4 sm:p-8 transition-all duration-300 ${
        isCollapsed ? 'ml-[60px]' : 'ml-[60px] sm:ml-64'
      }`}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">Satış performansına genel bakış</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Toplam Müşteri"
            value="1,234"
            icon={<Users className="h-6 w-6" />}
            trend={{ value: 12, isPositive: true }}
          />
          <DashboardCard
            title="Gelir"
            value="₺50,234"
            icon={<DollarSign className="h-6 w-6" />}
            trend={{ value: 8, isPositive: true }}
          />
          <DashboardCard
            title="Aktif Fırsatlar"
            value="45"
            icon={<Target className="h-6 w-6" />}
            trend={{ value: 5, isPositive: false }}
          />
          <DashboardCard
            title="Başarı Oranı"
            value="68%"
            icon={<Award className="h-6 w-6" />}
            trend={{ value: 3, isPositive: true }}
          />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Satış Performansı</h2>
          <SalesPerformance />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardChart />
          <DashboardBarChart />
        </div>
      </main>
    </div>
  );
};

export default Index;
