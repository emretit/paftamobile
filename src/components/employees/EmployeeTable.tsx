
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Employee } from "./types";
import { StatusBadge } from "./StatusBadge";
import { EmployeeDetailPanel } from "./details/EmployeeDetailPanel";

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
}

const EmployeeTable = ({ employees, isLoading }: EmployeeTableProps) => {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  
  const handleRowClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailPanelOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, employeeId: string) => {
    e.stopPropagation();
    navigate(`/employees/${employeeId}/edit`);
  };

  const handleViewDetailsClick = (e: React.MouseEvent, employeeId: string) => {
    e.stopPropagation();
    navigate(`/employees/${employeeId}`);
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Çalışan</TableHead>
              <TableHead>Departman</TableHead>
              <TableHead>Pozisyon</TableHead>
              <TableHead>İletişim</TableHead>
              <TableHead>İşe Başlama</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Çalışan bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow 
                  key={employee.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRowClick(employee)}
                >
                  <TableCell className="font-medium">
                    {employee.first_name} {employee.last_name}
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{employee.email}</span>
                      <span className="text-xs text-gray-500">{employee.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(employee.hire_date).toLocaleDateString("tr-TR")}</TableCell>
                  <TableCell><StatusBadge status={employee.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleViewDetailsClick(e, employee.id)}
                      >
                        <span className="sr-only">Detaylar</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleEditClick(e, employee.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <EmployeeDetailPanel
        employee={selectedEmployee}
        isOpen={isDetailPanelOpen}
        onClose={() => setIsDetailPanelOpen(false)}
      />
    </>
  );
};

export default EmployeeTable;
