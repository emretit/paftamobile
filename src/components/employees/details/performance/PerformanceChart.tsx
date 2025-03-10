
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartDataPoint {
  period: string;
  Technical: number;
  Communication: number;
  Teamwork: number;
  Leadership: number;
  Overall: number;
}

interface PerformanceChartProps {
  chartData: ChartDataPoint[];
}

export const PerformanceChart = ({ chartData }: PerformanceChartProps) => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Performans Trendi</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="Technical" fill="#8884d8" name="Teknik" />
                <Bar dataKey="Communication" fill="#82ca9d" name="İletişim" />
                <Bar dataKey="Teamwork" fill="#ffc658" name="Takım Çalışması" />
                <Bar dataKey="Leadership" fill="#ff8042" name="Liderlik" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Henüz performans değerlendirmesi yapılmamış
          </div>
        )}
      </CardContent>
    </Card>
  );
};
