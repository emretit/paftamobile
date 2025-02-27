
import { ServiceRequest } from "@/hooks/useServiceRequests";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { FileText, Calendar, Package, Building2, User, MessageSquare, AlertCircle, Clock, CheckCircle, Tag } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceActivitiesList } from "./ServiceActivitiesList";

interface ServiceRequestDetailProps {
  serviceRequest: ServiceRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

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

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'low': return 'Düşük';
    case 'medium': return 'Orta';
    case 'high': return 'Yüksek';
    case 'urgent': return 'Acil';
    default: return priority;
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
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'assigned':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'on_hold':
      return 'bg-gray-100 text-gray-800 border-gray-200';
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
    case 'cancelled':
      return 'İptal Edildi';
    case 'assigned':
      return 'Atandı';
    case 'on_hold':
      return 'Beklemede';
    default:
      return status;
  }
};

export function ServiceRequestDetail({ serviceRequest, isOpen, onClose }: ServiceRequestDetailProps) {
  if (!serviceRequest) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[700px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle>#{serviceRequest.id.substring(0, 8)} - {serviceRequest.title}</SheetTitle>
            <Badge 
              className={`${getStatusColor(serviceRequest.status)} ${
                getStatusColor(serviceRequest.status)
              }`}
            >
              {getStatusText(serviceRequest.status)}
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Oluşturulma Tarihi: {serviceRequest.created_at && format(new Date(serviceRequest.created_at), 'dd MMMM yyyy', { locale: tr })}</span>
            </div>
            {serviceRequest.due_date && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Tercih Edilen Tarih: {format(new Date(serviceRequest.due_date), 'dd MMMM yyyy', { locale: tr })}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/40 p-4 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1">Öncelik</div>
              <Badge 
                variant="secondary" 
                className={`${getPriorityColor(serviceRequest.priority)} border`}
              >
                {getPriorityText(serviceRequest.priority)}
              </Badge>
            </div>
            <div className="bg-muted/40 p-4 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1">Servis Tipi</div>
              <span className="text-base">{serviceRequest.service_type}</span>
            </div>
          </div>

          <Separator />

          {serviceRequest.description && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Açıklama</h3>
              <p className="text-muted-foreground whitespace-pre-line">{serviceRequest.description}</p>
            </div>
          )}

          {serviceRequest.location && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Konum</h3>
              <p className="text-muted-foreground">{serviceRequest.location}</p>
            </div>
          )}

          {serviceRequest.customer_id && (
            <div className="bg-muted/40 p-4 rounded-lg">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Müşteri</h3>
              </div>
              <p className="text-muted-foreground mt-1">Müşteri ID: {serviceRequest.customer_id}</p>
            </div>
          )}

          {serviceRequest.equipment_id && (
            <div className="bg-muted/40 p-4 rounded-lg">
              <div className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Ekipman</h3>
              </div>
              <p className="text-muted-foreground mt-1">Ekipman ID: {serviceRequest.equipment_id}</p>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              <h3 className="text-lg font-semibold">Servis Aktiviteleri</h3>
            </div>
            
            <ServiceActivitiesList serviceRequestId={serviceRequest.id} />
          </div>

          {serviceRequest.attachments && serviceRequest.attachments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  <h3 className="text-lg font-semibold">Ekler</h3>
                </div>
                <div className="space-y-2">
                  {serviceRequest.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/40 p-3 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{attachment.name}</span>
                      </div>
                      <Button variant="outline" size="sm">İndir</Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Kapat
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
