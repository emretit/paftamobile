
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
  sortField: "name" | "balance" | "company";
  sortDirection: "asc" | "desc";
  onSortFieldChange: (field: "name" | "balance" | "company") => void;
}

const CustomerList = ({ 
  customers, 
  isLoading, 
  sortField, 
  sortDirection, 
  onSortFieldChange 
}: CustomerListProps) => {
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 flex items-center gap-1 -ml-3 hover:bg-gray-100"
                onClick={() => onSortFieldChange("company")}
              >
                Şirket/Müşteri
                <ArrowUpDown className={`h-4 w-4 ${sortField === "company" ? "opacity-100" : "opacity-50"}`} />
              </Button>
            </TableHead>
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
                onClick={() => onSortFieldChange("balance")}
              >
                Bakiye
                <ArrowUpDown className={`h-4 w-4 ${sortField === "balance" ? "opacity-100" : "opacity-50"}`} />
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
