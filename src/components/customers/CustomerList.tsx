
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
}

const CustomerList = ({ customers, isLoading }: CustomerListProps) => {
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Müşteri Adı</TableHead>
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
              <TableCell colSpan={7} className="text-center py-8">
                Yükleniyor...
              </TableCell>
            </TableRow>
          ) : customers?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
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
