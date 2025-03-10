
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileEdit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalaryRecord } from "./types";

interface SalaryHistoryProps {
  salaryHistory: SalaryRecord[];
  isLoading: boolean;
}

export const SalaryHistory = ({ salaryHistory, isLoading }: SalaryHistoryProps) => {
  const calculateNetSalary = (record: SalaryRecord) => {
    return record.base_salary + record.allowances + record.bonuses - record.deductions;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maaş Geçmişi</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Yükleniyor...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ödeme Tarihi</TableHead>
                <TableHead>Temel Maaş</TableHead>
                <TableHead>Yan Ödemeler</TableHead>
                <TableHead>Bonuslar</TableHead>
                <TableHead>Kesintiler</TableHead>
                <TableHead>Net Ödeme</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Henüz maaş kaydı bulunmamaktadır.
                  </TableCell>
                </TableRow>
              ) : (
                salaryHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.payment_date).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>₺{record.base_salary.toLocaleString()}</TableCell>
                    <TableCell>₺{record.allowances.toLocaleString()}</TableCell>
                    <TableCell>₺{record.bonuses.toLocaleString()}</TableCell>
                    <TableCell>₺{record.deductions.toLocaleString()}</TableCell>
                    <TableCell>₺{calculateNetSalary(record).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'paid' ? 'bg-green-100 text-green-800' :
                        record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {record.status === 'paid' ? 'Ödendi' :
                         record.status === 'pending' ? 'Beklemede' :
                         'İşlemde'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <FileEdit className="h-4 w-4" />
                      </Button>
                    </TableCell>
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
