
import { useState } from "react";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceActivityForm } from "./ServiceActivityForm";
import { ServiceActivitiesList } from "./ServiceActivitiesList";
import { WarrantyInfo } from "./WarrantyInfo";
import { format } from "date-fns";
import { MessageSquare, Plus } from "lucide-react";

export function ServiceRequestTable() {
  const { data: serviceRequests, refetch } = useServiceRequests();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);

  const handleActivitySuccess = () => {
    refetch();
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Başlık</TableHead>
            <TableHead>Müşteri</TableHead>
            <TableHead>Öncelik</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Oluşturma Tarihi</TableHead>
            <TableHead>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {serviceRequests?.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.title}</TableCell>
              <TableCell>{request.customer_id}</TableCell>
              <TableCell>{request.priority}</TableCell>
              <TableCell>{request.status}</TableCell>
              <TableCell>
                {request.created_at && format(new Date(request.created_at), 'dd.MM.yyyy')}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(request.id);
                      setIsActivityFormOpen(false);
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Aktiviteler
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(request.id);
                      setIsActivityFormOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Aktivite Ekle
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog 
        open={selectedRequest !== null} 
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {isActivityFormOpen ? "Yeni Servis Aktivitesi" : "Servis Aktiviteleri"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <>
              {serviceRequests?.find(r => r.id === selectedRequest)?.equipment_id && (
                <WarrantyInfo 
                  equipmentId={serviceRequests.find(r => r.id === selectedRequest)?.equipment_id} 
                />
              )}
              
              {isActivityFormOpen ? (
                <ServiceActivityForm
                  serviceRequestId={selectedRequest}
                  onClose={() => setSelectedRequest(null)}
                  onSuccess={handleActivitySuccess}
                />
              ) : (
                <>
                  <ServiceActivitiesList serviceRequestId={selectedRequest} />
                  <div className="flex justify-end mt-4">
                    <Button
                      onClick={() => setIsActivityFormOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Yeni Aktivite Ekle
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
