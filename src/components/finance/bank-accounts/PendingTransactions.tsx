
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PendingTransactions = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">Bekleyen İşlemler</h3>
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">3 Bekleyen</span>
        </div>
        <Button variant="outline" size="sm">Tümünü Görüntüle</Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>İşlem Tarihi</TableHead>
            <TableHead>Tür</TableHead>
            <TableHead>Alıcı/Gönderen</TableHead>
            <TableHead>Açıklama</TableHead>
            <TableHead className="text-right">Tutar</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>İşlem</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>05.03.2024</TableCell>
            <TableCell>Düzenli Ödeme</TableCell>
            <TableCell>ABC Ltd.</TableCell>
            <TableCell>Kira Ödemesi - Mart 2024</TableCell>
            <TableCell className="text-right text-red-600">-₺25,000</TableCell>
            <TableCell>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                Onay Bekliyor
              </span>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Onayla</Button>
                <Button size="sm" variant="outline" className="text-red-600">İptal</Button>
              </div>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>06.03.2024</TableCell>
            <TableCell>Swift</TableCell>
            <TableCell>XYZ GmbH</TableCell>
            <TableCell>İthalat Ödemesi</TableCell>
            <TableCell className="text-right text-red-600">-€15,000</TableCell>
            <TableCell>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                Onay Bekliyor
              </span>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Onayla</Button>
                <Button size="sm" variant="outline" className="text-red-600">İptal</Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default PendingTransactions;
