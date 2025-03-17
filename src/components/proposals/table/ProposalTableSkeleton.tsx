
import { TableRow, TableCell, TableHeader, TableHead, TableBody } from "@/components/ui/table";
import { Table } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export const ProposalTableSkeleton = () => {
  return (
    <Table>
      <TableHeader className="bg-red-50 text-red-950">
        <TableRow>
          <TableHead className="font-semibold">Teklif No</TableHead>
          <TableHead className="font-semibold">Müşteri</TableHead>
          <TableHead className="font-semibold">Durum</TableHead>
          <TableHead className="font-semibold">Oluşturma Tarihi</TableHead>
          <TableHead className="font-semibold">Geçerlilik</TableHead>
          <TableHead className="font-semibold">Toplam Tutar</TableHead>
          <TableHead className="font-semibold text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
