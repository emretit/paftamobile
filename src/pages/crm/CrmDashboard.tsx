
import React from "react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActivitiesSummary from "@/components/crm/ActivitiesSummary";
import ProposalsSummary from "@/components/crm/ProposalsSummary";
import OpportunitiesSummary from "@/components/crm/OpportunitiesSummary";
import OrdersSummary from "@/components/crm/OrdersSummary";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, FileText, BarChart3, ShoppingCart, Plus } from "lucide-react";
import { useState } from "react";
import NewActivityDialog from "@/components/activities/NewActivityDialog";

interface CrmDashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const CrmDashboard: React.FC<CrmDashboardProps> = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const [isNewActivityDialogOpen, setIsNewActivityDialogOpen] = useState(false);

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
          {/* Activities Card */}
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-blue-50/80 via-blue-100/50 to-blue-200/30 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-blue-900">Aktiviteler</CardTitle>
                    <p className="text-sm text-blue-700/70 font-medium">Günlük işlemler</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-10 h-10 p-0 rounded-full bg-blue-500/20 hover:bg-blue-500 text-blue-700 hover:text-white border-0 shadow-md transition-all duration-200"
                  onClick={() => setIsNewActivityDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ActivitiesSummary />
            </CardContent>
          </Card>

          {/* Opportunities Card */}
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-emerald-50/80 via-emerald-100/50 to-emerald-200/30 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-emerald-900">Fırsatlar</CardTitle>
                    <p className="text-sm text-emerald-700/70 font-medium">Satış fırsatları</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-10 h-10 p-0 rounded-full bg-emerald-500/20 hover:bg-emerald-500 text-emerald-700 hover:text-white border-0 shadow-md transition-all duration-200"
                  onClick={() => navigate("/opportunities")}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <OpportunitiesSummary />
            </CardContent>
          </Card>

          {/* Proposals Card */}
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-purple-50/80 via-purple-100/50 to-purple-200/30 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-purple-900">Teklifler</CardTitle>
                    <p className="text-sm text-purple-700/70 font-medium">Müşteri teklifleri</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-10 h-10 p-0 rounded-full bg-purple-500/20 hover:bg-purple-500 text-purple-700 hover:text-white border-0 shadow-md transition-all duration-200"
                  onClick={() => navigate("/proposals")}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ProposalsSummary />
            </CardContent>
          </Card>

          {/* Orders Card */}
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-orange-50/80 via-orange-100/50 to-orange-200/30 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-orange-900">Siparişler</CardTitle>
                    <p className="text-sm text-orange-700/70 font-medium">Müşteri siparişleri</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-10 h-10 p-0 rounded-full bg-orange-500/20 hover:bg-orange-500 text-orange-700 hover:text-white border-0 shadow-md transition-all duration-200"
                  onClick={() => navigate("/orders")}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <OrdersSummary />
            </CardContent>
          </Card>
        </div>

        <NewActivityDialog
          isOpen={isNewActivityDialogOpen}
          onClose={() => setIsNewActivityDialogOpen(false)}
          onSuccess={() => {
            // Aktivite başarıyla eklendiğinde yapılacak işlemler
            setIsNewActivityDialogOpen(false);
          }}
        />
      </div>
    </DefaultLayout>
  );
};

export default CrmDashboard;
