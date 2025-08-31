
import React from "react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActivitiesSummary from "@/components/crm/ActivitiesSummary";
import ProposalsSummary from "@/components/crm/ProposalsSummary";
import OpportunitiesSummary from "@/components/crm/OpportunitiesSummary";
import OrdersSummary from "@/components/crm/OrdersSummary";
import QuickActions from "@/components/crm/summary/QuickActions";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, FileText, BarChart3, ShoppingCart } from "lucide-react";

interface CrmDashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const CrmDashboard: React.FC<CrmDashboardProps> = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="CRM Özeti"
      subtitle="Aktiviteler, fırsatlar, teklifler ve siparişlerin genel durumu"
    >
      {/* Modern Header Section */}
      <div className="mb-8 p-6 bg-gradient-to-r from-card via-muted/20 to-background rounded-2xl border border-border/50 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              CRM Kontrol Paneli
            </h1>
            <p className="text-muted-foreground mt-2">
              İş süreçlerinizi tek ekrandan yönetin ve takip edin
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span>Canlı Veriler</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Activities Column */}
          <Card className="bg-gradient-to-br from-blue-50/50 via-card to-blue-50/30 border-blue-200/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-bold flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Aktiviteler
                </span>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm flex items-center hover:bg-blue-100/50"
                onClick={() => navigate("/activities")}
              >
                Tümünü Gör
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ActivitiesSummary />
            </CardContent>
          </Card>

          {/* Opportunities Column */}
          <Card className="bg-gradient-to-br from-emerald-50/50 via-card to-emerald-50/30 border-emerald-200/50 shadow-lg hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-bold flex items-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                  Fırsatlar
                </span>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm flex items-center hover:bg-emerald-100/50"
                onClick={() => navigate("/opportunities")}
              >
                Tümünü Gör
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <OpportunitiesSummary />
            </CardContent>
          </Card>

          {/* Proposals Column */}
          <Card className="bg-gradient-to-br from-purple-50/50 via-card to-purple-50/30 border-purple-200/50 shadow-lg hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-bold flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  Teklifler
                </span>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm flex items-center hover:bg-purple-100/50"
                onClick={() => navigate("/proposals")}
              >
                Tümünü Gör
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ProposalsSummary />
            </CardContent>
          </Card>

          {/* Orders Column */}
          <Card className="bg-gradient-to-br from-orange-50/50 via-card to-orange-50/30 border-orange-200/50 shadow-lg hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-bold flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
                </div>
                <span className="bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                  Siparişler
                </span>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm flex items-center hover:bg-orange-100/50"
                onClick={() => navigate("/orders")}
              >
                Tümünü Gör
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <OrdersSummary />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </DefaultLayout>
  );
};

export default CrmDashboard;
