import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { SimpleGanttChart } from './SimpleGanttChart';
import { AdvancedFilters } from './AdvancedFilters';
import { BulkActions } from './BulkActions';
import './dispatcher-gantt.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Users, Clock, Filter, MapPin, Settings } from 'lucide-react';
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
  name: string;
  surname: string;
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
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
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
        .eq('department', 'Teknik Servis')
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

  // Servis taleplerini Gantt tasklerine dönüştür
  const ganttTasks = useMemo(() => {
    if (!filteredServiceRequests || !technicians) return { tasks: [], unassigned: [] };

    const tasks: any[] = [];
    const unassigned: ServiceRequest[] = [];

    filteredServiceRequests.forEach(request => {
      if (request.due_date) {
        const startDate = moment(request.due_date).toDate();
        const endDate = moment(request.due_date).add(2, 'hours').toDate();

        const task = {
          id: request.id,
          title: request.title,
          start: startDate,
          end: endDate,
          serviceRequest: request,
          technician: request.assigned_to ? getTechnicianName(request.assigned_to) : undefined,
          priority: request.priority,
          status: request.status,
          technicianId: request.assigned_to,
        };

        if (request.assigned_to) {
          tasks.push(task);
        } else {
          unassigned.push(request);
        }
      }
    });

    return { tasks, unassigned };
  }, [filteredServiceRequests, technicians, getTechnicianName]);

  // Unassigned requests'i ayrı useEffect ile güncelle
  useEffect(() => {
    if (ganttTasks.unassigned) {
      setUnassignedRequests(ganttTasks.unassigned);
    }
  }, [ganttTasks.unassigned]);

  // Görev seçildiğinde
  const handleTaskSelect = useCallback((task: any) => {
    if (task.serviceRequest) {
      onSelectRequest?.(task.serviceRequest);
    }
  }, [onSelectRequest]);

  // Görev tarih ve teknisyen değişikliği (drag & drop)
  const handleTaskMove = useCallback(async (taskId: string, newStart: Date, technicianId: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          due_date: moment(newStart).format('YYYY-MM-DD HH:mm:ss'),
          assigned_to: technicianId,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) {
        console.error('Görev güncellenemedi:', error);
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
    }
  }, []);

  // Atanmamış görevi teknisyene sürükle bırak
  const assignTaskToTechnician = useCallback(async (requestId: string, technicianId: string) => {
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
        console.error('Görev atanamadı:', error);
      }
    } catch (error) {
      console.error('Atama hatası:', error);
    }
  }, []);

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
  const handleTaskToggle = useCallback((taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  }, []);

  const handleSelectAll = useCallback((selectAll: boolean) => {
    if (selectAll) {
      setSelectedTasks((ganttTasks.tasks || []).map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  }, [ganttTasks.tasks]);

  const handleBulkAssign = useCallback(async (technicianId: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          assigned_to: technicianId,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .in('id', selectedTasks);

      if (error) {
        console.error('Toplu atama hatası:', error);
      } else {
        setSelectedTasks([]);
      }
    } catch (error) {
      console.error('Toplu atama hatası:', error);
    }
  }, [selectedTasks]);

  const handleBulkStatusChange = useCallback(async (status: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedTasks);

      if (error) {
        console.error('Toplu durum değiştirme hatası:', error);
      } else {
        setSelectedTasks([]);
      }
    } catch (error) {
      console.error('Toplu durum değiştirme hatası:', error);
    }
  }, [selectedTasks]);

  const handleBulkDelete = useCallback(async () => {
    if (window.confirm('Seçili görevleri silmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await supabase
          .from('service_requests')
          .delete()
          .in('id', selectedTasks);

        if (error) {
          console.error('Toplu silme hatası:', error);
        } else {
          setSelectedTasks([]);
        }
      } catch (error) {
        console.error('Toplu silme hatası:', error);
      }
    }
  }, [selectedTasks]);

  const handleClearSelection = useCallback(() => {
    setSelectedTasks([]);
  }, []);

  return (
    <div className="dispatcher-gantt-console h-full">
      <Card className="p-6 h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Dispatcher Console - Gantt Görünümü</h2>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 px-3 py-1 rounded-lg">
              <span className="text-sm font-medium text-blue-800">
                Bugün: {(ganttTasks.tasks || []).filter(t => moment(t.start).isSame(moment(), 'day')).length}
              </span>
            </div>
            <div className="bg-orange-100 px-3 py-1 rounded-lg">
              <span className="text-sm font-medium text-orange-800">
                Atanmamış: {unassignedRequests.length}
              </span>
            </div>
            <Button
              variant={showBulkActions ? "default" : "outline"}
              size="sm"
              onClick={() => setShowBulkActions(!showBulkActions)}
            >
              <Users className="h-4 w-4 mr-1" />
              Toplu İşlemler
            </Button>
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
            selectedTasks={selectedTasks}
            onSelectAll={handleSelectAll}
            onBulkAssign={handleBulkAssign}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkDelete={handleBulkDelete}
            technicians={technicians || []}
            totalTasks={(ganttTasks.tasks || []).length}
            onClearSelection={handleClearSelection}
          />
        )}

        {/* Gantt View - No Tabs */}
        <div className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              
              {/* Gantt Chart - Sol 3 kolon */}
              <div className="xl:col-span-3">
                {ganttTasks.tasks && ganttTasks.tasks.length > 0 || technicians ? (
                  <SimpleGanttChart
                    tasks={ganttTasks.tasks || []}
                    technicians={technicians || []}
                    onTaskSelect={handleTaskSelect}
                    onTaskMove={handleTaskMove}
                    selectedTasks={selectedTasks}
                    onTaskToggle={handleTaskToggle}
                    onSelectAll={handleSelectAll}
                    showSelection={showBulkActions}
                  />
                ) : (
                  <div className="flex items-center justify-center h-96 text-gray-500 bg-white border rounded-lg">
                    <div className="text-center">
                      <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Henüz planlanmış görev bulunmuyor</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Sağ 1 kolon */}
              <div className="xl:col-span-1 space-y-4">
                {/* İstatistikler */}
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Bugün
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">
                        {(ganttTasks.tasks || []).filter(t => 
                          moment(t.start).isSame(moment(), 'day')).length}
                      </div>
                      <div className="text-xs text-gray-600">Planlanan</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded">
                      <div className="text-lg font-bold text-orange-600">
                        {unassignedRequests.length}
                      </div>
                      <div className="text-xs text-gray-600">Atanmamış</div>
                    </div>
                  </div>
                </Card>

                {/* Atanmamış Görevler */}
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Atanmamış Görevler
                  </h3>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {unassignedRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-3 border rounded-lg cursor-move hover:bg-gray-50 transition-colors"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('requestId', request.id);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {request.title}
                            </h4>
                            {request.location && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {request.location}
                              </p>
                            )}
                            {request.due_date && (
                              <p className="text-xs text-gray-500 mt-1">
                                {moment(request.due_date).format('DD.MM.YYYY HH:mm')}
                              </p>
                            )}
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{
                              borderColor: priorityColors[request.priority as keyof typeof priorityColors],
                              color: priorityColors[request.priority as keyof typeof priorityColors]
                            }}
                          >
                            {request.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {unassignedRequests.length === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Tüm görevler atanmış</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Teknisyen Durumu */}
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Teknisyen Durumu
                  </h3>
                  
                  <div className="space-y-2">
                    {technicians?.slice(0, 5).map((tech) => {
                      const techTasks = (ganttTasks.tasks || []).filter(t => t.technicianId === tech.id);
                      const completedTasks = techTasks.filter(t => t.status === 'completed').length;
                      const totalTasks = techTasks.length;
                      
                      return (
                        <div key={tech.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {tech.name} {tech.surname}
                            </div>
                            <div className="text-xs text-gray-500">
                              {completedTasks}/{totalTasks} tamamlandı
                            </div>
                          </div>
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">
                              {totalTasks}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
        </div>
      </Card>
    </div>
  );
};
