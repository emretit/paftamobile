
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Star, TrendingUp } from "lucide-react";
import { PerformanceRecord } from "./types";

interface PerformanceStatsProps {
  latestScores: PerformanceRecord | null;
  performanceTrend: { trend: number; icon: string | null };
}

export const PerformanceStats = ({ latestScores, performanceTrend }: PerformanceStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Genel Performans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            {latestScores?.overall_score.toFixed(1) || "N/A"}
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.round(latestScores?.overall_score || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </div>
          {performanceTrend.trend !== 0 && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <TrendingUp 
                className={`h-3 w-3 ${
                  performanceTrend.icon === "up" ? 'text-green-500' : 'text-red-500 transform rotate-180'
                }`} 
              />
              {performanceTrend.trend > 0 ? '+' : ''}{performanceTrend.trend}% son değerlendirmeden
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Teknik Beceriler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {latestScores?.technical_score.toFixed(1) || "N/A"}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">İletişim</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {latestScores?.communication_score.toFixed(1) || "N/A"}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Takım Çalışması</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {latestScores?.teamwork_score.toFixed(1) || "N/A"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
