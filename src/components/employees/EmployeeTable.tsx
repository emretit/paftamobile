
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Pencil, Eye } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { Employee } from "./types";

interface EmployeeTableProps {
  employees: Employee[];
}

export const EmployeeTable = ({ employees }: EmployeeTableProps) => {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Çalışan</TableHead>
          <TableHead>Departman</TableHead>
          <TableHead>Pozisyon</TableHead>
          <TableHead>E-posta</TableHead>
          <TableHead>Telefon</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar>
                  {employee.avatar_url ? (
                    <AvatarImage src={employee.avatar_url} alt={`${employee.first_name} ${employee.last_name}`} />
                  ) : null}
                  <AvatarFallback>{employee.first_name[0]}{employee.last_name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(employee.hire_date).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>{employee.department}</TableCell>
            <TableCell>{employee.position}</TableCell>
            <TableCell>{employee.email}</TableCell>
            <TableCell>{employee.phone || "-"}</TableCell>
            <TableCell>
              <StatusBadge status={employee.status} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/employees/details/${employee.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/employees/edit/${employee.id}`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
