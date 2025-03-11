
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Employee } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface EmployeeDetailPanelProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmployeeDetailPanel = ({
  employee,
  isOpen,
  onClose,
}: EmployeeDetailPanelProps) => {
  if (!employee) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[90%] sm:w-[600px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <SheetTitle className="text-xl">{employee.first_name} {employee.last_name}</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          <SheetDescription>
            {employee.position} - {employee.department}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
              <TabsTrigger value="personal">Kişisel Bilgiler</TabsTrigger>
              <TabsTrigger value="salary">Maaş</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">E-posta</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="font-medium">{employee.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">İşe Başlama Tarihi</p>
                  <p className="font-medium">{new Date(employee.hire_date).toLocaleDateString("tr-TR")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Durum</p>
                  <p className="font-medium">{employee.status === "aktif" ? "Aktif" : "Pasif"}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Doğum Tarihi</p>
                  <p className="font-medium">
                    {employee.date_of_birth 
                      ? new Date(employee.date_of_birth).toLocaleDateString("tr-TR") 
                      : "-"
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cinsiyet</p>
                  <p className="font-medium">{employee.gender || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Medeni Durum</p>
                  <p className="font-medium">{employee.marital_status || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Adres</p>
                  <p className="font-medium">{employee.address || "-"}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="salary" className="space-y-4">
              <p className="text-center text-gray-500">Maaş bilgileri henüz eklenmemiş.</p>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
