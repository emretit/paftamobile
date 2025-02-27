
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
import { MessageSquare, Plus, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'in_progress':
      return <Clock className="w-4 h-4 text-blue-600" />;
    case 'new':
      return <AlertCircle className="w-4 h-4 text-purple-600" />;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'new':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Tamamlandı';
    case 'in_progress':
      return 'Devam Ediyor';
    case 'new':
      return 'Yeni';
    default:
      return status;
  }
};

export function ServiceRequestTable() {
  const { data: serviceRequests, isLoading, isError, refetch } = useServiceRequests();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);

  const handleActivitySuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md my-4">
        <p>Veri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
          Yeniden Dene
        </Button>
      </div>
    );
  }

  if (!serviceRequests || serviceRequests.length === 0) {
    return (
      <div className="text-center my-12 py-12 border border-dashed border-gray-300 rounded-lg">
        <div className="text-gray-400 mb-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Henüz servis talebi bulunmuyor</h3>
          <p className="mt-2">İlk servis talebinizi oluşturmak için "Yeni Servis Talebi" butonuna tıklayın.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Başlık</TableHead>
            <TableHead>Tür</TableHead>
            <TableHead>Öncelik</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Oluşturma Tarihi</TableHead>
            <TableHead>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {serviceRequests?.map((request) => (
            <TableRow key={request.id} className="group hover:bg-gray-50">
              <TableCell className="font-medium">{request.title}</TableCell>
              <TableCell>{request.service_type}</TableCell>
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={`${getPriorityColor(request.priority)} border`}
                >
                  {request.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(request.status)}
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(request.status)} border`}
                  >
                    {getStatusText(request.status)}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                {request.created_at && format(new Date(request.created_at), 'dd.MM.yyyy')}
              </TableCell>
              <TableCell>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
