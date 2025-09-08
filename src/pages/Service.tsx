
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import { useServiceRequests, ServiceRequest } from "@/hooks/useServiceRequests";
import { ServiceRequestDetail } from "@/components/service/ServiceRequestDetail";
import { DispatcherGanttConsole } from "@/components/service/dispatcher/DispatcherGanttConsole";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CalendarDays, Users, Clock, AlertCircle, CheckCircle, XCircle, Pause } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ServicePageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ServicePage = ({ isCollapsed, setIsCollapsed }: ServicePageProps) => {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: serviceRequests, isLoading, error } = useServiceRequests();

  const handleSelectRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  // İstatistikleri hesapla
  const stats = {
    total: serviceRequests?.length || 0,
    new: serviceRequests?.filter(r => r.status === 'new').length || 0,
    inProgress: serviceRequests?.filter(r => r.status === 'in_progress').length || 0,
    completed: serviceRequests?.filter(r => r.status === 'completed').length || 0,
    urgent: serviceRequests?.filter(r => r.priority === 'urgent').length || 0,
    unassigned: serviceRequests?.filter(r => !r.assigned_to).length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <TopBar />
        <div className="w-full p-6">
          <div className="space-y-6">
            {/* Salesforce Style Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CalendarDays className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Servis Yönetimi</h1>
                    <p className="text-gray-600 mt-1">Teknisyenlerinizi yönetin ve servis taleplerini takip edin</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="gap-2">
                    <Users className="h-4 w-4" />
                    Teknisyenler
                  </Button>
                  <Button onClick={() => navigate('/service/new')} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Yeni Servis Talebi
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards - Salesforce Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <Card className="p-4 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Talep</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Yeni</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Devam Ediyor</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tamamlandı</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Acil</p>
                    <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                  </div>
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Atanmamış</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.unassigned}</p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <XCircle className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </Card>
            </div>


            {/* Gantt Console - Full Width */}
            <div className="h-[calc(100vh-300px)] min-h-[600px]">
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
