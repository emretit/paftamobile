
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import { useServiceRequests, ServiceRequest } from "@/hooks/useServiceRequests";
import { ServiceRequestDetail } from "@/components/service/ServiceRequestDetail";
import { DispatcherGanttConsole } from "@/components/service/dispatcher/DispatcherGanttConsole";
import { Button } from "@/components/ui/button";
import { Plus, CalendarDays } from "lucide-react";

interface ServicePageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ServicePage = ({ isCollapsed, setIsCollapsed }: ServicePageProps) => {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
            {/* Basit Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Servis Yönetimi</h1>
                  <p className="text-gray-600">Gantt Console ile servis taleplerini yönetin</p>
                </div>
              </div>
              <Button onClick={() => navigate('/service/new')} className="gap-2">
                <Plus className="h-4 w-4" />
                Yeni Servis Talebi
              </Button>
            </div>

            {/* Gantt Console - Full Width */}
            <div className="h-[calc(100vh-200px)]">
              <DispatcherGanttConsole onSelectRequest={handleSelectRequest} />
            </div>
          </div>

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
