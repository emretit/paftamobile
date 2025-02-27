
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import { ServiceRequestTable } from "@/components/service/ServiceRequestTable";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceRequestForm } from "@/components/service/ServiceRequestForm";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ServicePageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ServicePage = ({ isCollapsed, setIsCollapsed }: ServicePageProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: serviceRequests } = useServiceRequests();

  // Servis talepleri için özet istatistikleri hesapla
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Servis Yönetimi</h1>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Yeni Servis Talebi
            </Button>
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

          <ServiceRequestTable />
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Servis Talebi Oluştur</DialogTitle>
              </DialogHeader>
              <ServiceRequestForm onClose={() => setIsCreateModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default ServicePage;
