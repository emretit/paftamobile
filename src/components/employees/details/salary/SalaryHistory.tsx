
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileEdit, Calendar } from "lucide-react";
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
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader className="bg-white pb-2 border-b border-gray-100">
        <CardTitle className="text-lg flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary" />
          Maaş Geçmişi
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
            <p>Maaş geçmişi yükleniyor...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
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
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      <p className="mb-2">Henüz maaş kaydı bulunmamaktadır.</p>
                      <p className="text-sm">Çalışana ait maaş kayıtları burada görüntülenecek.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  salaryHistory.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell>{new Date(record.payment_date).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>₺{record.base_salary.toLocaleString()}</TableCell>
                      <TableCell>₺{record.allowances.toLocaleString()}</TableCell>
                      <TableCell>₺{record.bonuses.toLocaleString()}</TableCell>
                      <TableCell>₺{record.deductions.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">₺{calculateNetSalary(record).toLocaleString()}</TableCell>
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
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-primary">
                          <FileEdit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
