
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import type { Employee } from "./types";

interface EmployeeTableProps {
  employees: Employee[];
}

export const EmployeeTable = ({ employees }: EmployeeTableProps) => {
  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">ÇALIŞAN</TableHead>
            <TableHead>DEPARTMAN</TableHead>
            <TableHead>İŞE BAŞLAMA</TableHead>
            <TableHead>E-POSTA</TableHead>
            <TableHead>TELEFON</TableHead>
            <TableHead>DURUM</TableHead>
            <TableHead className="text-right">İŞLEMLER</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee.avatar_url || undefined} />
                    <AvatarFallback>{employee.first_name[0]}{employee.last_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <div className="font-medium">{employee.first_name} {employee.last_name}</div>
                    <div className="text-sm text-gray-500">{employee.position}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{employee.department}</TableCell>
              <TableCell>{new Date(employee.hire_date).toLocaleDateString('tr-TR')}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>{employee.phone || '-'}</TableCell>
              <TableCell>
                <StatusBadge status={employee.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">Detaylar</Button>
                  <Button variant="outline" size="sm">Düzenle</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
