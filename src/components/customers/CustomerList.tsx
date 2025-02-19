
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
import CustomerTableRow from "./CustomerTableRow";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  mobile_phone: string | null;
  office_phone: string | null;
  company: string | null;
  type: "bireysel" | "kurumsal";
  status: "aktif" | "pasif" | "potansiyel";
  representative: string | null;
  balance: number;
  address: string | null;
}

interface CustomerListProps {
  customers: Customer[] | undefined;
  isLoading: boolean;
  sortDirection: "asc" | "desc";
  onSortDirectionChange: (direction: "asc" | "desc") => void;
}

const CustomerList = ({ customers, isLoading, sortDirection, onSortDirectionChange }: CustomerListProps) => {
  const toggleSort = () => {
    onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc");
  };

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Şirket/Müşteri</TableHead>
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
          ) : customers?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                Müşteri bulunamadı
              </TableCell>
            </TableRow>
          ) : (
            customers?.map((customer) => (
              <CustomerTableRow key={customer.id} customer={customer} />
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default CustomerList;
