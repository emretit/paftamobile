import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { ServiceRequestTable } from "@/components/service/ServiceRequestTable";
import { Button } from "@/components/ui/button";
import { Plus, CalendarIcon, LayoutGrid, Table as TableIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceRequestForm } from "@/components/service/ServiceRequestForm";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServiceRequestCalendar } from "@/components/service/ServiceRequestCalendar";
import { ServiceRequestDetail } from "@/components/service/ServiceRequestDetail";
import type { ServiceRequest } from "@/hooks/useServiceRequests";

type ViewType = "table" | "calendar";

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

  // Get summary stats
  const getSummaryStats = () => {
    if (!serviceRequests) return { total: 0, new: 0, inProgress: 0, completed: 0 };
    
    return {
      total: serviceRequests.length,
      new: serviceRequests.filter(req => req.status === 'new').length,
      inProgress: serviceRequests.filter(req => req.status === 'in_progress').length,
      completed: serviceRequests.filter(req => req.status === 'completed').length,
      highPriority: serviceRequests.filter(req => req.priority === 'high').length
    };
  };

  const stats = getSummaryStats();

  const handleSelectRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  const getViewComponent = () => {
    switch (activeView) {
      case "calendar":
        return (
          <ServiceRequestCalendar
            searchQuery={searchQuery}
            statusFilter={statusFilter === "all" ? null : statusFilter}
            technicianFilter={technicianFilter === "all" ? null : technicianFilter}
            onSelectRequest={handleSelectRequest}
          />
        );
      case "table":
      default:
        return (
          <ServiceRequestTable
            searchQuery={searchQuery}
            statusFilter={statusFilter === "all" ? null : statusFilter}
            technicianFilter={technicianFilter === "all" ? null : technicianFilter}
            onSelectRequest={handleSelectRequest}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <div className="container mx-auto p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Servis Yönetimi</h1>
              <p className="text-gray-600 mt-1">Tüm servis taleplerini görüntüleyin ve yönetin</p>
            </div>
            <div className="flex gap-3 items-center">
              <div className="bg-white border rounded-md p-1 flex items-center">
                <Button 
                  variant={activeView === "table" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setActiveView("table")}
                  className="px-3"
                >
                  <TableIcon className="h-4 w-4 mr-2" />
                  Tablo
                </Button>
                <Button 
                  variant={activeView === "calendar" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setActiveView("calendar")}
                  className="px-3"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Takvim
                </Button>
              </div>
              <Button 
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Servis Talebi
              </Button>
            </div>
          </div>

          {/* Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Talepler</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tüm servis talepleri
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yeni Talepler</CardTitle>
                <AlertTriangle className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.new}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Henüz işleme alınmamış
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Devam Edenler</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Üzerinde çalışılan talepler
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tamamlananlar</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Çözüme kavuşmuş talepler
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filtreler */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Servis talebi ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Durum seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="new">Yeni</SelectItem>
                  <SelectItem value="assigned">Atandı</SelectItem>
                  <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal Edildi</SelectItem>
                  <SelectItem value="on_hold">Beklemede</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={technicianFilter}
                onValueChange={(value) => setTechnicianFilter(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Teknisyen seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <ScrollArea className={`h-[calc(100vh-280px)] ${activeView === "calendar" ? "pr-4" : ""}`}>
            {getViewComponent()}
          </ScrollArea>
          
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
