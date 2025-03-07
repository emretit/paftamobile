
import { useState, useEffect } from "react";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { useServiceRequests, ServiceRequest, ServiceStatus } from "@/hooks/useServiceRequests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText, Edit, Trash2, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

interface ServiceRequestTableProps {
  searchQuery: string;
  statusFilter: string | null;
  technicianFilter: string | null;
  onSelectRequest: (request: ServiceRequest) => void;
}

export function ServiceRequestTable({ 
  searchQuery, 
  statusFilter, 
  technicianFilter,
  onSelectRequest
}: ServiceRequestTableProps) {
  const { data: serviceRequests, isLoading } = useServiceRequests();
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get employee names for assigned technicians
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name");
      
      if (error) throw error;
      return data;
    },
  });

  // Apply filters when dependencies change
  useEffect(() => {
    if (!serviceRequests) return;

    let results = [...serviceRequests];

    // Apply search filter
    if (searchQuery) {
      results = results.filter(
        (request) =>
          request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      results = results.filter((request) => request.status === statusFilter);
    }

    // Apply technician filter
    if (technicianFilter) {
      results = results.filter((request) => request.assigned_to === technicianFilter);
    }

    setFilteredRequests(results);
  }, [serviceRequests, searchQuery, statusFilter, technicianFilter]);

  // Delete service request
  const deleteServiceRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("service_requests")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      toast({
        title: "Servis talebi silindi",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error deleting service request:", error);
      toast({
        title: "Hata",
        description: "Servis talebi silinemedi",
        variant: "destructive",
      });
    },
  });

  // Get status badge color
  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case "new":
        return <Badge className="bg-purple-500">Yeni</Badge>;
      case "assigned":
        return <Badge className="bg-blue-500">Atandı</Badge>;
      case "in_progress":
        return <Badge className="bg-orange-500">Devam Ediyor</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Tamamlandı</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">İptal</Badge>;
      case "on_hold":
        return <Badge className="bg-yellow-500">Beklemede</Badge>;
      default:
        return <Badge>Bilinmiyor</Badge>;
    }
  };

  // Get technician name
  const getTechnicianName = (technicianId?: string) => {
    if (!technicianId || !employees) return "-";
    
    const employee = employees.find((e) => e.id === technicianId);
    return employee ? `${employee.first_name} ${employee.last_name}` : "-";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-gray-500">Servis talepleri yükleniyor...</div>
      </div>
    );
  }

  if (!filteredRequests.length) {
    return (
      <div className="bg-white rounded-md border p-8 text-center">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Servis talebi bulunamadı</h3>
        <p className="text-gray-500 mt-2">
          Arama kriterlerinize uygun servis talebi bulunmuyor
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border overflow-hidden">
      <Table>
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
        <TableBody>
          {filteredRequests.map((request) => (
            <TableRow 
              key={request.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onSelectRequest(request)}
            >
              <TableCell className="font-medium">
                {request.id.substring(0, 8)}
              </TableCell>
              <TableCell>{request.title}</TableCell>
              <TableCell>
                {request.customer_id ? request.customer_id.substring(0, 8) : "-"}
              </TableCell>
              <TableCell>
                {request.due_date
                  ? format(parseISO(request.due_date), "dd MMM yyyy", { locale: tr })
                  : "-"}
              </TableCell>
              <TableCell>{getTechnicianName(request.assigned_to)}</TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell>
                <Badge variant="outline" className={
                  request.priority === "high" 
                    ? "border-red-500 text-red-800 bg-red-50" 
                    : request.priority === "medium"
                    ? "border-yellow-500 text-yellow-800 bg-yellow-50"
                    : "border-blue-500 text-blue-800 bg-blue-50"
                }>
                  {request.priority === "high" 
                    ? "Yüksek" 
                    : request.priority === "medium" 
                    ? "Orta" 
                    : "Düşük"}
                </Badge>
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Menüyü aç</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onSelectRequest(request)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Detaylar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => {
                        if (confirm('Bu servis talebini silmek istediğinizden emin misiniz?')) {
                          deleteServiceRequest.mutate(request.id);
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Sil</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
