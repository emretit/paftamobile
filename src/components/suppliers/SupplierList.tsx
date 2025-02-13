
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SupplierTableRow from "./SupplierTableRow";
import { Supplier } from "@/types/supplier";

interface SupplierListProps {
  suppliers: Supplier[] | undefined;
  isLoading: boolean;
}

const SupplierList = ({ suppliers, isLoading }: SupplierListProps) => {
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Şirket/Tedarikçi</TableHead>
            <TableHead>Yetkili Kişi</TableHead>
            <TableHead>İletişim</TableHead>
            <TableHead>Tip</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Temsilci</TableHead>
            <TableHead>Bakiye</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                Yükleniyor...
              </TableCell>
            </TableRow>
          ) : suppliers?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                Tedarikçi bulunamadı
              </TableCell>
            </TableRow>
          ) : (
            suppliers?.map((supplier) => (
              <SupplierTableRow key={supplier.id} supplier={supplier} />
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default SupplierList;
