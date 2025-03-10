
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, PieChart, List, FileText, BarChart, Activity, Zap } from "lucide-react";

import OpportunitiesSummary from "./OpportunitiesSummary";
import TasksSummary from "./TasksSummary";
import ProposalsSummary from "./ProposalsSummary";
import DealAnalytics from "./DealAnalytics";
import ProposalAnalytics from "./ProposalAnalytics";

const CrmSummary = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {/* Opportunities Summary */}
        <Card className="w-full shadow-md border border-gray-200 h-full bg-white">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">Fırsatlar</CardTitle>
              <div className="bg-blue-100 p-2 rounded-full">
                <PieChart className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <CardDescription>Aktif fırsatlar ve durumları</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <OpportunitiesSummary />
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-4">
            <Button 
              variant="outline" 
              className="w-full justify-center"
              onClick={() => navigate("/deals")}
            >
              Tüm Fırsatları Görüntüle
            </Button>
            <Button
              className="w-full justify-center"
              onClick={() => navigate("/deals/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Fırsat
            </Button>
          </CardFooter>
        </Card>

        {/* Tasks Summary */}
        <Card className="w-full shadow-md border border-gray-200 h-full bg-white">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">Görevler</CardTitle>
              <div className="bg-green-100 p-2 rounded-full">
                <List className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <CardDescription>Görevler ve durumları</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <TasksSummary />
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-4">
            <Button 
              variant="outline" 
              className="w-full justify-center"
              onClick={() => navigate("/tasks")}
            >
              Tüm Görevleri Görüntüle
            </Button>
            <Button
              className="w-full justify-center"
              onClick={() => navigate("/tasks/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Görev
            </Button>
          </CardFooter>
        </Card>

        {/* Proposals Summary */}
        <Card className="w-full shadow-md border border-gray-200 h-full bg-white">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">Teklifler</CardTitle>
              <div className="bg-purple-100 p-2 rounded-full">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <CardDescription>Teklifler ve durumları</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <ProposalsSummary />
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-4">
            <Button 
              variant="outline" 
              className="w-full justify-center"
              onClick={() => navigate("/proposals")}
            >
              Tüm Teklifleri Görüntüle
            </Button>
            <Button 
              className="w-full justify-center"
              onClick={() => navigate("/proposal-form")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Teklif
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Analitik Görünüm</h2>
        
        {/* Deal Analytics */}
        <Card className="shadow-md border border-gray-200 bg-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold">Fırsat Analizi</CardTitle>
                <CardDescription>Fırsat dönüşümleri ve performans</CardDescription>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <BarChart className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DealAnalytics />
          </CardContent>
        </Card>
        
        {/* Proposal Analytics */}
        <Card className="shadow-md border border-gray-200 bg-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold">Teklif Analizi</CardTitle>
                <CardDescription>Teklif dönüşümleri ve performans</CardDescription>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ProposalAnalytics />
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card className="shadow-md border border-gray-200 bg-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold">Hızlı İşlemler</CardTitle>
              <div className="bg-amber-100 p-2 rounded-full">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                size="lg" 
                className="w-full h-16 text-lg"
                onClick={() => navigate("/deals/new")}
              >
                <Plus className="h-5 w-5 mr-2" />
                Yeni Fırsat Oluştur
              </Button>
              <Button 
                size="lg" 
                className="w-full h-16 text-lg"
                onClick={() => navigate("/proposal-form")}
              >
                <Plus className="h-5 w-5 mr-2" />
                Yeni Teklif Oluştur
              </Button>
              <Button 
                size="lg" 
                className="w-full h-16 text-lg"
                onClick={() => navigate("/tasks/new")}
              >
                <Plus className="h-5 w-5 mr-2" />
                Yeni Görev Oluştur
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrmSummary;
