import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { mockDealsAPI, mockOpportunitiesAPI } from "@/services/mockCrmService";
import OpportunitiesSummary from "@/components/crm/OpportunitiesSummary";

interface CrmDashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const CrmDashboard = ({ isCollapsed, setIsCollapsed }: CrmDashboardProps) => {
  const { data: deals, isLoading: dealsLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const { data } = await mockDealsAPI.getDeals();
      return data || [];
    },
  });

  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const { data } = await mockOpportunitiesAPI.getOpportunities();
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
            <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Fırsatları ve satışları buradan takip edin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Fırsat Özetleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OpportunitiesSummary />
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Satış Performansı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>Satış performansı grafiği</div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Aktiviteler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>Aktivite listesi</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CrmDashboard;
