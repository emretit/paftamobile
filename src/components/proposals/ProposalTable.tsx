
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const ProposalTable = () => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teklif No</TableHead>
            <TableHead>Müşteri</TableHead>
            <TableHead>Teklif Tarihi</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Toplam Tutar</TableHead>
            <TableHead>Satış Temsilcisi</TableHead>
            <TableHead>Son Güncelleme</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
              Henüz teklif bulunmuyor. Yeni bir teklif oluşturmak için "Yeni Teklif" butonuna tıklayın.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default ProposalTable;

