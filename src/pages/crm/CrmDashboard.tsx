
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Activities Column */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-bold flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Aktiviteler
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm flex items-center"
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
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-bold flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                Fırsatlar
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm flex items-center"
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
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-bold flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Teklifler
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm flex items-center"
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
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-bold flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-primary" />
                Siparişler
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm flex items-center"
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
