
import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ServiceRequest, ServiceStatus, ServicePriority } from "@/hooks/useServiceRequests";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Tag, MapPin, User, Package, FileText, Save, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

// Import refactored components
import { RequestHeader } from "./detail/RequestHeader";
import { RequestDates } from "./detail/RequestDates";
import { RequestMetadata } from "./detail/RequestMetadata";
import { RequestDescription } from "./detail/RequestDescription";
import { RequestLocation } from "./detail/RequestLocation";
import { CustomerInfo } from "./detail/CustomerInfo";
import { EquipmentInfo } from "./detail/EquipmentInfo";
import { ServiceActivitiesSection } from "./detail/ServiceActivitiesSection";
import { RequestAttachments } from "./detail/RequestAttachments";

interface ServiceRequestDetailProps {
  serviceRequest: ServiceRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceRequestDetail({ serviceRequest, isOpen, onClose }: ServiceRequestDetailProps) {
  const [status, setStatus] = useState<ServiceStatus>("new");
  const [priority, setPriority] = useState<ServicePriority>("medium");
  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (serviceRequest) {
      setStatus(serviceRequest.status);
      setPriority(serviceRequest.priority);
      setAssignedTo(serviceRequest.assigned_to);
      setNotes(serviceRequest.notes?.join("\n") || "");
    }
  }, [serviceRequest]);

  // Get the list of technicians
  const { data: technicians } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, department")
        .eq("department", "Teknik Servis")
        .order("first_name");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Get all employees as fallback
  const { data: allEmployees } = useQuery({
    queryKey: ["all-employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, department")
        .order("first_name");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Prepare the employees list for the dropdown
  const employees = technicians?.length ? technicians : allEmployees || [];

  // Update service request
  const updateServiceRequest = useMutation({
    mutationFn: async () => {
      if (!serviceRequest) return;

      const notesArray = notes
        .split("\n")
        .filter(line => line.trim() !== "");

      const { error } = await supabase
        .from("service_requests")
        .update({
          status,
          priority,
          assigned_to: assignedTo,
          notes: notesArray
        })
        .eq("id", serviceRequest.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      toast({
        title: "Servis talebi güncellendi",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error updating service request:", error);
      toast({
        title: "Hata",
        description: "Servis talebi güncellenemedi",
        variant: "destructive",
      });
    },
  });

  if (!serviceRequest) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[700px] overflow-y-auto">
        <RequestHeader serviceRequest={serviceRequest} />

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Durum</label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as ServiceStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Yeni</SelectItem>
                  <SelectItem value="assigned">Atandı</SelectItem>
                  <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                  <SelectItem value="on_hold">Beklemede</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Öncelik</label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as ServicePriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="urgent">Acil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Atanan Teknisyen</label>
            <Select
              value={assignedTo || ""}
              onValueChange={(value) => setAssignedTo(value === "" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Teknisyen seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Atanmamış</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <RequestDates 
            createdAt={serviceRequest.created_at} 
            dueDate={serviceRequest.due_date}
          />

          <RequestMetadata 
            priority={serviceRequest.priority} 
            serviceType={serviceRequest.service_type}
          />

          <Separator />

          <RequestDescription description={serviceRequest.description} />
          
          <RequestLocation location={serviceRequest.location} />
          
          <CustomerInfo customerId={serviceRequest.customer_id} />
          
          <EquipmentInfo equipmentId={serviceRequest.equipment_id} />

          <Separator />

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Notlar</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Servis talebi ile ilgili notlar..."
              className="h-24"
            />
          </div>

          <ServiceActivitiesSection serviceRequestId={serviceRequest.id} />

          {serviceRequest.attachments && serviceRequest.attachments.length > 0 && (
            <>
              <Separator />
              <RequestAttachments attachments={serviceRequest.attachments} />
            </>
          )}

          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Kapat
            </Button>
            <Button 
              onClick={() => updateServiceRequest.mutate()}
              disabled={updateServiceRequest.isPending}
            >
              {updateServiceRequest.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Kaydet
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
