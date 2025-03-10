
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalaryRecord } from "./types";

interface SalaryStatsProps {
  salaryHistory: SalaryRecord[];
}

export const SalaryStats = ({ salaryHistory }: SalaryStatsProps) => {
  const calculateNetSalary = (record: SalaryRecord) => {
    return record.base_salary + record.allowances + record.bonuses - record.deductions;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Son Maaş</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {salaryHistory.length > 0 ? 
              `₺${calculateNetSalary(salaryHistory[salaryHistory.length - 1]).toLocaleString()}` : 
              "₺0"}
          </div>
          <p className="text-xs text-gray-500">
            {salaryHistory.length > 0 ? 
              `${new Date(salaryHistory[salaryHistory.length - 1].payment_date).toLocaleDateString('tr-TR')}` : 
              "-"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Toplam Bonuslar (Yıllık)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {`₺${salaryHistory.reduce((sum, record) => sum + record.bonuses, 0).toLocaleString()}`}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Ortalama Aylık Net</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {salaryHistory.length > 0 ? 
              `₺${(salaryHistory.reduce((sum, record) => sum + calculateNetSalary(record), 0) / salaryHistory.length).toLocaleString()}` : 
              "₺0"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
