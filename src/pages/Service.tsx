
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

  const { data: serviceRequests } = useServiceRequests();

  // Teknisyenleri getir
  const { data: technicians } = useQuery({
    queryKey: ['technicians-service'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('department', 'Teknik')
        .eq('status', 'aktif');
      
      if (error) throw error;
      return data || [];
    },
  });

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
        <div className="max-w-[1800px] mx-auto p-6">
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

            {/* Teknisyenler Bölümü */}
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Aktif Teknisyenler</h2>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {technicians?.length || 0} Teknisyen
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {technicians?.map((tech) => (
                  <div key={tech.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {tech.first_name[0]}{tech.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tech.first_name} {tech.last_name}</p>
                        <p className="text-sm text-gray-500">{tech.department}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!technicians || technicians.length === 0) && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    Teknisyen bulunamadı
                  </div>
                )}
              </div>
            </Card>

            {/* Gantt Console - Full Width */}
            <Card className="p-6 bg-white border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Servis Talepleri - Gantt Görünümü</h2>
              <div className="h-[600px]">
                <DispatcherGanttConsole onSelectRequest={handleSelectRequest} />
              </div>
            </Card>
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
