
import { useState, useEffect } from 'react';
import { Users, ShoppingBag, DollarSign, BarChart3 } from 'lucide-react';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import DashboardCard from '@/components/DashboardCard';
import DashboardBarChart from '@/components/DashboardBarChart';
import { supabase } from '@/integrations/supabase/client';

interface DashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Dashboard = ({ isCollapsed, setIsCollapsed }: DashboardProps) => {
  const [stats, setStats] = useState({
    customers: 0,
    employees: 0,
    products: 0,
    revenue: 0,
  });

  // Sample data for chart
  const chartData = [
    { name: 'Ocak', total: 1200 },
    { name: 'Şubat', total: 1900 },
    { name: 'Mart', total: 1500 },
    { name: 'Nisan', total: 2400 },
    { name: 'Mayıs', total: 2800 },
    { name: 'Haziran', total: 1900 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customers count
        const { count: customersCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });

        // Fetch employees count
        const { count: employeesCount } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true });

        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        setStats({
          customers: customersCount || 0,
          employees: employeesCount || 0,
          products: productsCount || 0,
          revenue: 145000, // Sample data
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Dashboard"
      subtitle="Manage your business activities"
    >
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Toplam Müşteri"
            value={stats.customers}
            icon={<Users className="h-5 w-5" />}
          />
          <DashboardCard
            title="Toplam Çalışan"
            value={stats.employees}
            icon={<Users className="h-5 w-5" />}
          />
          <DashboardCard
            title="Toplam Ürün"
            value={stats.products}
            icon={<ShoppingBag className="h-5 w-5" />}
          />
          <DashboardCard
            title="Toplam Gelir"
            value={new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(stats.revenue)}
            icon={<DollarSign className="h-5 w-5" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardBarChart 
            title="Aylık Gelir"
            data={chartData}
            dataKey="total"
          />
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-medium mb-4">Son Aktiviteler</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Yeni sipariş oluşturuldu</p>
                  <p className="text-sm text-gray-500">Acme Ltd. şirketi</p>
                </div>
                <p className="text-xs text-gray-500">12 dakika önce</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Müşteri kaydı yapıldı</p>
                  <p className="text-sm text-gray-500">Mehmet Yılmaz</p>
                </div>
                <p className="text-xs text-gray-500">2 saat önce</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Satış tamamlandı</p>
                  <p className="text-sm text-gray-500">Teknik A.Ş. - ₺24,500</p>
                </div>
                <p className="text-xs text-gray-500">Dün</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
