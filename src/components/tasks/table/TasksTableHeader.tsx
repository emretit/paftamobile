
import React from "react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

const TasksTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Başlık</TableHead>
        <TableHead>Atanan</TableHead>
        <TableHead>Öncelik</TableHead>
        <TableHead>Durum</TableHead>
        <TableHead>Tip</TableHead>
        <TableHead>Son Tarih</TableHead>
        <TableHead className="w-[50px]"></TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default TasksTableHeader;
