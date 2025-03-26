
import { Card } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const DashboardCard = ({ title, value, icon, trend }: DashboardCardProps) => {
  return (
    <Card className="p-4 border border-border shadow-md transition-all hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-full bg-primary/10">{icon}</div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend.isPositive ? "text-success" : "text-destructive"
            }`}
          >
            {trend.isPositive ? "+" : "-"}{trend.value}%
            <span className={`inline-block ${trend.isPositive ? "rotate-0" : "rotate-180"}`}>
              ↑
            </span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-xl font-bold mt-1">{value}</p>
      </div>
    </Card>
  );
};

export default DashboardCard;
