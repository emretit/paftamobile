
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Download } from "lucide-react";
import { useState } from "react";

const TransactionHistory = () => {
  const [selectedType, setSelectedType] = useState("all");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">Son İşlemler</h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Bu Ay: 24 İşlem</span>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedType}
            onValueChange={setSelectedType}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tür" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm İşlemler</SelectItem>
              <SelectItem value="incoming">Gelen</SelectItem>
              <SelectItem value="outgoing">Giden</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Ekstre İndir</span>
          </Button>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih</TableHead>
            <TableHead>İşlem</TableHead>
            <TableHead>Açıklama</TableHead>
            <TableHead>Hesap</TableHead>
            <TableHead className="text-right">Tutar</TableHead>
            <TableHead>Bakiye</TableHead>
            <TableHead>Durum</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>01.03.2024</TableCell>
            <TableCell>EFT Gelen</TableCell>
            <TableCell>Müşteri Ödemesi</TableCell>
            <TableCell>Ziraat - 1234</TableCell>
            <TableCell className="text-right text-green-600">+₺15,000</TableCell>
            <TableCell>₺85,000</TableCell>
            <TableCell>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Tamamlandı
              </span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>29.02.2024</TableCell>
            <TableCell>Havale Giden</TableCell>
            <TableCell>Tedarikçi Ödemesi</TableCell>
            <TableCell>İş Bank - 7654</TableCell>
            <TableCell className="text-right text-red-600">-$5,000</TableCell>
            <TableCell>$75,000</TableCell>
            <TableCell>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Tamamlandı
              </span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>28.02.2024</TableCell>
            <TableCell>Swift Gelen</TableCell>
            <TableCell>İhracat Bedeli</TableCell>
            <TableCell>Garanti - 9876</TableCell>
            <TableCell className="text-right text-green-600">+€10,000</TableCell>
            <TableCell>€40,000</TableCell>
            <TableCell>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Tamamlandı
              </span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionHistory;
