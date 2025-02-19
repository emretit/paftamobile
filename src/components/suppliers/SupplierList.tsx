
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import SupplierTableRow from "./SupplierTableRow";
import { Supplier } from "@/types/supplier";

interface SupplierListProps {
  suppliers: Supplier[] | undefined;
  isLoading: boolean;
  sortDirection: "asc" | "desc";
  onSortDirectionChange: (direction: "asc" | "desc") => void;
}

const SupplierList = ({ suppliers, isLoading, sortDirection, onSortDirectionChange }: SupplierListProps) => {
  const toggleSort = () => {
    onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc");
  };

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
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 flex items-center gap-1 -ml-3 hover:bg-gray-100"
                onClick={toggleSort}
              >
                Bakiye
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
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
