
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, TrendingUp } from "lucide-react";
import { usePerformanceData, usePerformanceStats } from "./performance/usePerformanceData";
import { PerformanceChart } from "./performance/PerformanceChart";
import { PerformanceHistoryTable } from "./performance/PerformanceHistoryTable";
import { PerformanceStats } from "./performance/PerformanceStats";
import { PerformanceForm } from "./performance/PerformanceForm";

interface EmployeePerformanceTabProps {
  employeeId: string;
}

export const EmployeePerformanceTab = ({ employeeId }: EmployeePerformanceTabProps) => {
  const [showForm, setShowForm] = useState(false);
  const { performanceHistory, isLoading, addPerformanceRecord } = usePerformanceData(employeeId);
  const { latestScores, performanceTrend, chartData } = usePerformanceStats(performanceHistory);

  const handleAddPerformance = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  if (isLoading) {
    return <div className="py-8 text-center">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-primary" />
          Performans Yönetimi
        </h2>
        <Button onClick={handleAddPerformance} className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Yeni Değerlendirme
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performans Değerlendirmesi Ekle</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceForm 
              employeeId={employeeId} 
              onSuccess={addPerformanceRecord} 
              onClose={handleCloseForm} 
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {performanceHistory.length > 0 ? (
            <>
              <PerformanceStats 
                latestScores={latestScores} 
                performanceTrend={performanceTrend} 
              />
              
              <Card className="overflow-hidden">
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg">Performans Trendi</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-80">
                    <PerformanceChart data={chartData} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performans Geçmişi</CardTitle>
                </CardHeader>
                <CardContent>
                  <PerformanceHistoryTable data={performanceHistory} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-10">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">Henüz performans değerlendirmesi bulunmuyor</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Bu çalışan için performans değerlendirmesi eklemek için "Yeni Değerlendirme" butonuna tıklayın.
                  </p>
                  <Button onClick={handleAddPerformance} className="mt-6" variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Değerlendirme Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
