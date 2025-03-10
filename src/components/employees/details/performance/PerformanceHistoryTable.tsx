
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PerformanceRecord } from "./types";

interface PerformanceHistoryTableProps {
  performanceHistory: PerformanceRecord[];
  isLoading: boolean;
}

export const PerformanceHistoryTable = ({ performanceHistory, isLoading }: PerformanceHistoryTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performans Değerlendirme Geçmişi</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Yükleniyor...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dönem</TableHead>
                <TableHead>Teknik</TableHead>
                <TableHead>İletişim</TableHead>
                <TableHead>Takım Çalışması</TableHead>
                <TableHead>Liderlik</TableHead>
                <TableHead>Genel</TableHead>
                <TableHead>Değerlendiren</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Henüz performans değerlendirmesi yapılmamış.
                  </TableCell>
                </TableRow>
              ) : (
                performanceHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {record.review_period.substring(0, 4)}/{record.review_period.substring(5, 7)}
                    </TableCell>
                    <TableCell>{record.technical_score}</TableCell>
                    <TableCell>{record.communication_score}</TableCell>
                    <TableCell>{record.teamwork_score}</TableCell>
                    <TableCell>{record.leadership_score}</TableCell>
                    <TableCell>{record.overall_score.toFixed(1)}</TableCell>
                    <TableCell>{record.reviewer_name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
