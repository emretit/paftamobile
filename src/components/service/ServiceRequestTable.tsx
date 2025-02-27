
import { useState } from "react";
import { useServiceRequests, ServicePriority, ServiceStatus } from "@/hooks/useServiceRequests";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ServiceActivityForm } from "./ServiceActivityForm";
import { ServiceActivitiesList } from "./ServiceActivitiesList";
import { ServiceRequestForm } from "./ServiceRequestForm";
import { WarrantyInfo } from "./WarrantyInfo";
import { format } from "date-fns";
import { MessageSquare, Plus, AlertCircle, Clock, CheckCircle, Edit, Trash, MoreVertical, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'urgent':
      return 'bg-purple-100 text-purple-800 border-purple-200';
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
  const { 
    data: serviceRequests, 
    isLoading, 
    isError, 
    refetch, 
    deleteServiceRequest 
  } = useServiceRequests();
  
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState<any>(null);

  const handleActivitySuccess = () => {
    refetch();
  };

  const handleEditRequest = (request: any) => {
    setSelectedRequestData(request);
    setIsEditModalOpen(true);
  };

  const handleDeleteRequest = (request: any) => {
    setSelectedRequestData(request);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRequestData) {
      deleteServiceRequest(selectedRequestData.id);
      setIsDeleteModalOpen(false);
      setSelectedRequestData(null);
    }
  };

  const handleDownloadAttachment = async (attachment: any) => {
    if (!attachment.path) return;
    
    const { data, error } = await supabase.storage
      .from('service-attachments')
      .download(attachment.path);
    
    if (error) {
      console.error("Error downloading file:", error);
      return;
    }
    
    // Create blob link to download
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', attachment.name);
    
    // Append to html link element page and click it
    document.body.appendChild(link);
    link.click();
    
    // Clean up and remove the link
    link.parentNode?.removeChild(link);
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
            <TableHead className="text-right">İşlemler</TableHead>
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
                  {request.priority === 'low' ? 'Düşük' : 
                   request.priority === 'medium' ? 'Orta' :
                   request.priority === 'high' ? 'Yüksek' : 
                   request.priority === 'urgent' ? 'Acil' : request.priority}
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
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
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
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        setSelectedRequest(request.id);
                        setIsActivityFormOpen(true);
                      }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Aktivite Ekle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditRequest(request)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Düzenle
                      </DropdownMenuItem>
                      {request.attachments && request.attachments.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Ekler</DropdownMenuLabel>
                          {request.attachments.map((attachment: any, idx: number) => (
                            <DropdownMenuItem 
                              key={idx}
                              onClick={() => handleDownloadAttachment(attachment)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {attachment.name}
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600" 
                        onClick={() => handleDeleteRequest(request)}
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Aktiviteler Dialog */}
      <Dialog 
        open={selectedRequest !== null && !isEditModalOpen} 
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

      {/* Edit Request Dialog */}
      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setSelectedRequestData(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Servis Talebini Düzenle</DialogTitle>
          </DialogHeader>
          {selectedRequestData && (
            <ServiceRequestForm 
              onClose={() => setIsEditModalOpen(false)} 
              initialData={selectedRequestData}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) setSelectedRequestData(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Servis Talebini Sil</DialogTitle>
            <DialogDescription>
              Bu servis talebini silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm ilişkili aktiviteler de silinecektir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
