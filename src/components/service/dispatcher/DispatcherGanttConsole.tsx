import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { SimpleGanttChart } from './SimpleGanttChart';
import { AdvancedFilters } from './AdvancedFilters';
import { BulkActions } from './BulkActions';
import './dispatcher-gantt.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Users, Clock, Filter, MapPin, Settings, CheckCircle } from 'lucide-react';
import { useServiceRequests, ServiceRequest } from '@/hooks/useServiceRequests';
import { useTechnicianNames } from '../hooks/useTechnicianNames';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import moment from 'moment';
import 'moment/locale/tr';

// Türkçe moment lokali
moment.locale('tr');

interface Technician {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department: string;
  status: 'active' | 'inactive' | 'on_break';
}

interface DispatcherGanttConsoleProps {
  onSelectRequest?: (request: ServiceRequest) => void;
}

const priorityColors = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const statusColors = {
  new: '#6b7280',
  assigned: '#3b82f6',
  in_progress: '#8b5cf6',
  completed: '#10b981',
  cancelled: '#ef4444',
  on_hold: '#f59e0b',
};

export const DispatcherGanttConsole: React.FC<DispatcherGanttConsoleProps> = ({
  onSelectRequest
}) => {
  const [activeTab, setActiveTab] = useState<'gantt' | 'resources'>('gantt');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [unassignedRequests, setUnassignedRequests] = useState<ServiceRequest[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [technicianFilter, setTechnicianFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [locationFilter, setLocationFilter] = useState('');
  
  // Bulk selection states
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  const { data: serviceRequests } = useServiceRequests();
  const { getTechnicianName } = useTechnicianNames();

  // Teknisyenleri getir
  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('department', 'Teknik')
        .eq('status', 'aktif');
      
      if (error) throw error;
      return data as Technician[];
    },
  });

  // Filtrelenmiş servis taleplerini al
  const filteredServiceRequests = useMemo(() => {
    if (!serviceRequests) return [];

    return serviceRequests.filter(request => {
      // Arama filtresi
      if (searchQuery && !request.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Durum filtresi
      if (statusFilter !== 'all' && request.status !== statusFilter) {
        return false;
      }

      // Teknisyen filtresi
      if (technicianFilter !== 'all') {
        if (technicianFilter === 'unassigned' && request.assigned_to) {
          return false;
        }
        if (technicianFilter !== 'unassigned' && request.assigned_to !== technicianFilter) {
          return false;
        }
      }

      // Öncelik filtresi
      if (priorityFilter !== 'all' && request.priority !== priorityFilter) {
        return false;
      }

      // Tarih aralığı filtresi
      if (dateRange.from || dateRange.to) {
        if (!request.due_date) return false;
        const requestDate = moment(request.due_date);
        if (dateRange.from && requestDate.isBefore(dateRange.from, 'day')) {
          return false;
        }
        if (dateRange.to && requestDate.isAfter(dateRange.to, 'day')) {
          return false;
        }
      }

      // Konum filtresi
      if (locationFilter && request.location && !request.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [serviceRequests, searchQuery, statusFilter, technicianFilter, priorityFilter, dateRange, locationFilter]);

  // Servis taleplerini Gantt servislerine dönüştür
  const ganttServices = useMemo(() => {
    if (!filteredServiceRequests || !technicians) return { services: [], unassigned: [] };

    const services: any[] = [];
    const unassigned: ServiceRequest[] = [];

    filteredServiceRequests.forEach(request => {
      if (request.due_date) {
        const startDate = moment(request.due_date).toDate();
        const endDate = moment(request.due_date).add(2, 'hours').toDate();

        const service = {
          id: request.id,
          title: request.title,
          start: startDate,
          end: endDate,
          serviceRequest: request,
          technician: request.assigned_to ? getTechnicianName(request.assigned_to) : undefined,
          priority: request.priority,
          status: request.status,
          technicianId: request.assigned_to,
          serviceType: request.service_type,
          location: request.location,
          isService: true
        };

        if (request.assigned_to) {
          services.push(service);
        } else {
          unassigned.push(request);
        }
      }
    });

    return { services, unassigned };
  }, [filteredServiceRequests, technicians, getTechnicianName]);

  // Unassigned requests'i ayrı useEffect ile güncelle
  useEffect(() => {
    if (ganttServices.unassigned) {
      setUnassignedRequests(ganttServices.unassigned);
    }
  }, [ganttServices.unassigned]);

  // Servis seçildiğinde
  const handleServiceSelect = useCallback((service: any) => {
    if (service.serviceRequest) {
      onSelectRequest?.(service.serviceRequest);
    }
  }, [onSelectRequest]);

  // Servis tarih ve teknisyen değişikliği (drag & drop)
  const handleServiceMove = useCallback(async (serviceId: string, newStart: Date, technicianId: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          due_date: moment(newStart).format('YYYY-MM-DD HH:mm:ss'),
          assigned_to: technicianId,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', serviceId);

      if (error) {
        console.error('Servis güncellenemedi:', error);
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
    }
  }, []);

  // Atanmamış servisi teknisyene sürükle bırak
  const assignServiceToTechnician = useCallback(async (requestId: string, technicianId: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          assigned_to: technicianId,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        console.error('Servis atanamadı:', error);
      } else {
        // Başarılı atama sonrası sayfayı yenile
        window.location.reload();
      }
    } catch (error) {
      console.error('Atama hatası:', error);
    }
  }, []);

  // Drag over event handler
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Drop event handler for unassigned services
  const handleUnassignedServiceDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const requestId = e.dataTransfer.getData('text/plain');
    const technicianId = e.currentTarget.getAttribute('data-technician-id');
    
    if (requestId && technicianId) {
      assignServiceToTechnician(requestId, technicianId);
    }
  }, [assignServiceToTechnician]);

  // Filtreleri temizle
  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setTechnicianFilter('all');
    setPriorityFilter('all');
    setDateRange({ from: undefined, to: undefined });
    setLocationFilter('');
  }, []);

  // Bulk actions handlers
  const handleServiceToggle = useCallback((serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  }, []);

  const handleSelectAll = useCallback((selectAll: boolean) => {
    if (selectAll) {
      setSelectedServices((ganttServices.services || []).map(service => service.id));
    } else {
      setSelectedServices([]);
    }
  }, [ganttServices.services]);

  const handleBulkAssign = useCallback(async (technicianId: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          assigned_to: technicianId,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .in('id', selectedServices);

      if (error) {
        console.error('Toplu atama hatası:', error);
      } else {
        setSelectedServices([]);
      }
    } catch (error) {
      console.error('Toplu atama hatası:', error);
    }
  }, [selectedServices]);

  const handleBulkStatusChange = useCallback(async (status: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedServices);

      if (error) {
        console.error('Toplu durum değiştirme hatası:', error);
      } else {
        setSelectedServices([]);
      }
    } catch (error) {
      console.error('Toplu durum değiştirme hatası:', error);
    }
  }, [selectedServices]);

  const handleBulkDelete = useCallback(async () => {
    if (window.confirm('Seçili servisleri silmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await supabase
          .from('service_requests')
          .delete()
          .in('id', selectedServices);

        if (error) {
          console.error('Toplu silme hatası:', error);
        } else {
          setSelectedServices([]);
        }
      } catch (error) {
        console.error('Toplu silme hatası:', error);
      }
    }
  }, [selectedServices]);

  const handleClearSelection = useCallback(() => {
    setSelectedServices([]);
  }, []);

  return (
    <div className="dispatcher-gantt-console h-full bg-gray-50">
      <div className="h-full space-y-4">
        {/* Clean Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Servis Planlama</h2>
                <p className="text-sm text-gray-600">Teknisyen atamaları ve servis planlama</p>
              </div>
            </div>
            
            {/* Compact Stats */}
            <div className="flex flex-wrap gap-2">
              <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-center min-w-[80px]">
                <div className="text-sm font-bold">
                  {(ganttServices.services || []).filter(s => 
                    moment(s.start).isSame(moment(), 'day')).length}
                </div>
                <div className="text-xs opacity-90">Bugün</div>
              </div>
              <div className="bg-orange-500 text-white px-3 py-2 rounded-lg text-center min-w-[80px]">
                <div className="text-sm font-bold">{unassignedRequests.length}</div>
                <div className="text-xs opacity-90">Atanmamış</div>
              </div>
              <div className="bg-green-600 text-white px-3 py-2 rounded-lg text-center min-w-[80px]">
                <div className="text-sm font-bold">
                  {(ganttServices.services || []).filter(s => s.status === 'completed').length}
                </div>
                <div className="text-xs opacity-90">Tamamlandı</div>
              </div>
              <Button
                variant={showBulkActions ? "default" : "outline"}
                size="sm"
                onClick={() => setShowBulkActions(!showBulkActions)}
                className={showBulkActions ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <Users className="h-4 w-4 mr-1" />
                Toplu İşlemler
              </Button>
            </div>
          </div>
        </div>


        {/* Advanced Filters */}
        <AdvancedFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          technicianFilter={technicianFilter}
          setTechnicianFilter={setTechnicianFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          technicians={technicians || []}
          onClearFilters={clearAllFilters}
        />

        {/* Bulk Actions */}
        {showBulkActions && (
          <BulkActions
            selectedServices={selectedServices}
            onSelectAll={handleSelectAll}
            onBulkAssign={handleBulkAssign}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkDelete={handleBulkDelete}
            technicians={technicians || []}
            totalServices={(ganttServices.services || []).length}
            onClearSelection={handleClearSelection}
          />
        )}

        {/* Main Gantt View with Unassigned Services Sidebar */}
        <div className="flex flex-col xl:flex-row gap-4">
          {/* Gantt Chart */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {ganttServices.services && ganttServices.services.length > 0 || technicians ? (
              <SimpleGanttChart
                services={ganttServices.services || []}
                technicians={technicians || []}
                onServiceSelect={handleServiceSelect}
                onServiceMove={handleServiceMove}
                selectedServices={selectedServices}
                onServiceToggle={handleServiceToggle}
                onSelectAll={handleSelectAll}
                showSelection={showBulkActions}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Henüz planlanmış servis bulunmuyor</p>
                  <p className="text-sm text-gray-400 mt-2">Yeni servis talepleri oluşturun veya mevcut talepleri planlayın</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Unassigned Services Sidebar */}
          <div className="w-full xl:w-96 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-orange-50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-600" />
                Atanmamış Servisler
                <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-800">
                  {unassignedRequests.length}
                </Badge>
              </h3>
              <p className="text-sm text-gray-600 mt-1">Servisleri sürükleyip teknisyenlere atayın</p>
            </div>
            
            <div className="p-4 space-y-3 max-h-[400px] xl:max-h-[600px] overflow-y-auto">
              {unassignedRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-3 border border-dashed border-orange-200 rounded-lg cursor-move hover:border-orange-400 hover:bg-orange-50 transition-all group"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', request.id);
                    e.dataTransfer.effectAllowed = 'move';
                    
                    // Atanmamış görev için özel drag image oluştur
                    const dragImage = document.createElement('div');
                    dragImage.innerHTML = `
                      <div style="
                        background: linear-gradient(135deg, ${priorityColors[request.priority as keyof typeof priorityColors]} 0%, ${priorityColors[request.priority as keyof typeof priorityColors]}dd 100%);
                        color: white;
                        padding: 8px 12px;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 600;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        border: 2px dashed #f59e0b;
                        max-width: 200px;
                        position: relative;
                      ">
                        <div style="
                          position: absolute;
                          top: -8px;
                          right: -8px;
                          background: #f59e0b;
                          color: white;
                          border-radius: 50%;
                          width: 16px;
                          height: 16px;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          font-size: 10px;
                          font-weight: bold;
                        ">!</div>
                        ${request.title}
                      </div>
                    `;
                    document.body.appendChild(dragImage);
                    e.dataTransfer.setDragImage(dragImage, 0, 0);
                    setTimeout(() => document.body.removeChild(dragImage), 0);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-orange-800">
                        {request.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        {request.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{request.location}</span>
                          </div>
                        )}
                        {request.due_date && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {moment(request.due_date).format('DD.MM HH:mm')}
                          </div>
                        )}
                      </div>
                    </div>
                    <span 
                      className="inline-block px-2 py-1 rounded text-xs font-medium ml-2 flex-shrink-0"
                      style={{
                        backgroundColor: `${priorityColors[request.priority as keyof typeof priorityColors]}20`,
                        color: priorityColors[request.priority as keyof typeof priorityColors]
                      }}
                    >
                      {request.priority}
                    </span>
                  </div>
                </div>
              ))}
              
              {unassignedRequests.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
                  <p className="text-sm font-medium">Tüm servisler atanmış!</p>
                  <p className="text-xs text-gray-400 mt-1">Harika iş çıkarıyorsunuz</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
