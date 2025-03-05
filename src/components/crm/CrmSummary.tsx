
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, PieChart, List, FileText } from "lucide-react";

import OpportunitiesSummary from "./OpportunitiesSummary";
import ActivitiesSummary from "./ActivitiesSummary";
import ProposalsSummary from "./ProposalsSummary";

const CrmSummary = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Opportunities Section */}
        <Card className="w-full shadow-sm border border-gray-200 h-full">
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

        {/* Activities Section */}
        <Card className="w-full shadow-sm border border-gray-200 h-full">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">Aktiviteler</CardTitle>
              <div className="bg-green-100 p-2 rounded-full">
                <List className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <CardDescription>Görevler ve toplantılar</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <ActivitiesSummary />
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-4">
            <Button 
              variant="outline" 
              className="w-full justify-center"
              onClick={() => navigate("/tasks")}
            >
              Tüm Aktiviteleri Görüntüle
            </Button>
            <Button
              className="w-full justify-center"
              onClick={() => navigate("/tasks/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Aktivite
            </Button>
          </CardFooter>
        </Card>

        {/* Proposals Section */}
        <Card className="w-full shadow-sm border border-gray-200 h-full md:col-span-2 lg:col-span-1">
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
    </div>
  );
};

export default CrmSummary;
