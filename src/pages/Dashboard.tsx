
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { mockCrmService } from "@/services/mockCrmService";

interface DashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Dashboard = ({ isCollapsed, setIsCollapsed }: DashboardProps) => {
  const { data: deals, isLoading: dealsLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const { data } = await mockCrmService.getDeals();
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <TopBar />
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Genel bakış ve önemli bilgiler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Toplam Satış Fırsatları
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dealsLoading ? (
                  <p>Yükleniyor...</p>
                ) : (
                  <p className="text-2xl font-bold text-blue-600">
                    {deals?.length || 0}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Ortalama Fırsat Değeri
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dealsLoading ? (
                  <p>Yükleniyor...</p>
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    ₺
                    {deals?.reduce((acc, deal) => acc + deal.value, 0) /
                      (deals?.length || 1)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Bekleyen Görevler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">12</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
