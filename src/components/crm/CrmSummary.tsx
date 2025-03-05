import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, LineChart, List, Clock, CheckCircle, AlertTriangle, BarChart, FileText } from "lucide-react";

import OpportunitiesSummary from "./OpportunitiesSummary";
import ActivitiesSummary from "./ActivitiesSummary";
import ProposalsSummary from "./ProposalsSummary";

const CrmSummary = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Opportunities Section */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">Fırsatlar</CardTitle>
            <div className="bg-blue-100 p-2 rounded-full">
              <PieChart className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <CardDescription>Aktif fırsatlar ve durumları</CardDescription>
        </CardHeader>
        <CardContent>
          <OpportunitiesSummary />
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate("/deals")}
          >
            Tüm Fırsatları Görüntüle
          </Button>
        </CardFooter>
      </Card>

      {/* Activities Section */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">Aktiviteler</CardTitle>
            <div className="bg-green-100 p-2 rounded-full">
              <List className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <CardDescription>Görevler ve toplantılar</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivitiesSummary />
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate("/tasks")}
          >
            Tüm Aktiviteleri Görüntüle
          </Button>
        </CardFooter>
      </Card>

      {/* Proposals Section */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">Teklifler</CardTitle>
            <div className="bg-purple-100 p-2 rounded-full">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <CardDescription>Teklifler ve durumları</CardDescription>
        </CardHeader>
        <CardContent>
          <ProposalsSummary />
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={() => navigate("/proposals")}
          >
            Tüm Teklifleri Görüntüle
          </Button>
          <Button 
            className="flex-1" 
            onClick={() => navigate("/proposal-form")}
          >
            Yeni Teklif
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CrmSummary;
