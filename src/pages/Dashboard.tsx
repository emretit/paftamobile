import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import DashboardChart from "@/components/DashboardChart";
import DashboardCard from "@/components/DashboardCard";
import * as mockCrmService from "@/services/mockCrmService";
import { useQuery } from "@tanstack/react-query";

interface DashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Dashboard = ({ isCollapsed, setIsCollapsed }: DashboardProps) => {
  const [salesData, setSalesData] = useState([
    { name: "Ocak", total: 2400 },
    { name: "Şubat", total: 1398 },
    { name: "Mart", total: 9800 },
    { name: "Nisan", total: 3908 },
    { name: "Mayıs", total: 4800 },
    { name: "Haziran", total: 3800 },
  ]);

  const { data: opportunities, isLoading: opportunitiesLoading, error: opportunitiesError } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const { data, error } = await mockCrmService.mockOpportunitiesAPI.getOpportunities();
      if (error) throw error;
      return data;
    },
  });

  const totalOpportunities = opportunities ? opportunities.length : 0;
  const acceptedOpportunities = opportunities ? opportunities.filter(opp => opp.status === 'accepted').length : 0;

  return (
    <DefaultLayout isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} title="Dashboard" subtitle="Genel Bakış">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard title="Toplam Satış Fırsatları" value={totalOpportunities} />
        <DashboardCard title="Kabul Edilen Fırsatlar" value={acceptedOpportunities} />
        <DashboardCard title="Aktif Kullanıcılar" value={32} />
        <DashboardCard title="Yeni Müşteriler" value={12} />
      </div>

      <Card className="mb-6">
        <DashboardChart title="Aylık Satışlar" data={salesData} dataKey="total" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Son Satış Fırsatları</h3>
            {opportunitiesLoading ? (
              <div>Yükleniyor...</div>
            ) : opportunitiesError ? (
              <div>Fırsatlar yüklenirken bir hata oluştu.</div>
            ) : (
              <ul>
                {opportunities && opportunities.slice(0, 5).map((opportunity) => (
                  <li key={opportunity.id} className="py-2 border-b">
                    {opportunity.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Açık Taskler</h3>
            <ul>
              <li className="py-2 border-b">Task 1</li>
              <li className="py-2 border-b">Task 2</li>
              <li className="py-2 border-b">Task 3</li>
            </ul>
          </div>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
