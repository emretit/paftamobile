
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, Plus } from "lucide-react";

const AccountList = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <h3 className="font-semibold">Banka Hesapları</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            <span>Hesap Bağla</span>
          </Button>
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Yeni Hesap</span>
          </Button>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Banka</TableHead>
            <TableHead>Hesap No</TableHead>
            <TableHead>IBAN</TableHead>
            <TableHead>Hesap Türü</TableHead>
            <TableHead>Para Birimi</TableHead>
            <TableHead className="text-right">Bakiye</TableHead>
            <TableHead>Son İşlem</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ziraat Bankası</TableCell>
            <TableCell>1234567</TableCell>
            <TableCell>TR12 0001 0012 3456 7890 1234 56</TableCell>
            <TableCell>Vadesiz</TableCell>
            <TableCell>TRY</TableCell>
            <TableCell className="text-right">₺85,000</TableCell>
            <TableCell>01.03.2024</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>İş Bankası</TableCell>
            <TableCell>7654321</TableCell>
            <TableCell>TR98 0006 4000 0011 2233 4455 66</TableCell>
            <TableCell>Vadeli</TableCell>
            <TableCell>USD</TableCell>
            <TableCell className="text-right">$75,000</TableCell>
            <TableCell>29.02.2024</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Garanti BBVA</TableCell>
            <TableCell>9876543</TableCell>
            <TableCell>TR45 0006 2000 1234 5678 9012 34</TableCell>
            <TableCell>Vadesiz</TableCell>
            <TableCell>EUR</TableCell>
            <TableCell className="text-right">€40,000</TableCell>
            <TableCell>28.02.2024</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default AccountList;
