
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceRequestForm } from "@/components/service/ServiceRequestForm";
import { useServiceRequests, ServiceRequest } from "@/hooks/useServiceRequests";
import { ServiceRequestDetail } from "@/components/service/ServiceRequestDetail";
import { ViewType } from "@/components/service/view/ServiceViewToggle";
import { ServicePageHeader } from "@/components/service/header/ServicePageHeader";
import { ServiceSummaryStats } from "@/components/service/stats/ServiceSummaryStats";
import { ServiceFilters } from "@/components/service/filters/ServiceFilters";
import { ServiceContentView } from "@/components/service/view/ServiceContentView";

interface ServicePageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ServicePage = ({ isCollapsed, setIsCollapsed }: ServicePageProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [technicianFilter, setTechnicianFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const { data: serviceRequests } = useServiceRequests();

  const handleSelectRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <TopBar />
        <div className="max-w-[1800px] mx-auto section-padding">
          <div className="space-y-6 animate-fade-in">
            <ServicePageHeader 
              activeView={activeView}
              setActiveView={setActiveView}
              onCreateRequest={() => setIsCreateModalOpen(true)}
            />

            <ServiceSummaryStats serviceRequests={serviceRequests} />

            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <ServiceFilters 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                technicianFilter={technicianFilter}
                setTechnicianFilter={setTechnicianFilter}
              />
            </div>

            <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
              <ServiceContentView 
                activeView={activeView}
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                technicianFilter={technicianFilter}
                onSelectRequest={handleSelectRequest}
              />
            </div>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Servis Talebi Oluştur</DialogTitle>
              </DialogHeader>
              <ServiceRequestForm onClose={() => setIsCreateModalOpen(false)} />
            </DialogContent>
          </Dialog>

          <ServiceRequestDetail 
            serviceRequest={selectedRequest}
            isOpen={isDetailOpen}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedRequest(null);
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default ServicePage;
