
import React from "react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

const ServiceTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow className="bg-gray-50">
        <TableHead>Servis No</TableHead>
        <TableHead>Başlık</TableHead>
        <TableHead>Müşteri</TableHead>
        <TableHead>Tarih</TableHead>
        <TableHead>Teknisyen</TableHead>
        <TableHead>Durum</TableHead>
        <TableHead>Öncelik</TableHead>
        <TableHead className="text-right">İşlemler</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ServiceTableHeader;
