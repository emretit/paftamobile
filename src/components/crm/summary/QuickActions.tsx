
import { Zap, BarChart3, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import NewActivityDialog from "@/components/activities/NewActivityDialog";

const QuickActions = () => {
  const navigate = useNavigate();
  const [isNewActivityDialogOpen, setIsNewActivityDialogOpen] = useState(false);

  const handleActivitySuccess = () => {
    // Aktivite başarıyla eklendiğinde yapılacak işlemler
  };

  return (
    <Card className="bg-gradient-to-br from-card via-muted/10 to-background border-border/50 shadow-xl backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Hızlı İşlemler
          </CardTitle>
          <div className="bg-gradient-to-br from-amber-100 to-amber-50 p-3 rounded-full shadow-lg">
            <Zap className="h-6 w-6 text-amber-600" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button 
            size="lg" 
            className="w-full h-20 text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02]"
            onClick={() => navigate("/opportunities")}
          >
            <BarChart3 className="h-6 w-6 mr-3" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Yeni Fırsat</span>
              <span className="text-sm opacity-90">Oluştur</span>
            </div>
          </Button>
          <Button 
            size="lg" 
            className="w-full h-20 text-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02]"
            onClick={() => navigate("/proposals")}
          >
            <FileText className="h-6 w-6 mr-3" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Yeni Teklif</span>
              <span className="text-sm opacity-90">Oluştur</span>
            </div>
          </Button>
          <Button 
            size="lg" 
            className="w-full h-20 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02]"
            onClick={() => setIsNewActivityDialogOpen(true)}
          >
            <Calendar className="h-6 w-6 mr-3" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Yeni Aktivite</span>
              <span className="text-sm opacity-90">Oluştur</span>
            </div>
          </Button>
        </div>
      </CardContent>

      <NewActivityDialog
        isOpen={isNewActivityDialogOpen}
        onClose={() => setIsNewActivityDialogOpen(false)}
        onSuccess={handleActivitySuccess}
      />
    </Card>
  );
};

export default QuickActions;
