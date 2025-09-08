
import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import { useServiceRequests, ServiceRequest } from "@/hooks/useServiceRequests";
import { ServiceRequestDetail } from "@/components/service/ServiceRequestDetail";
import { ServiceRequestForm } from "@/components/service/ServiceRequestForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, CalendarDays, Users, Clock, AlertCircle, CheckCircle, XCircle, Pause, ChevronLeft, ChevronRight, Eye, EyeOff, User, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/tr';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('tr');
// Haftanın Pazartesi'den başlaması için
moment.updateLocale('tr', {
  week: {
    dow: 1, // Pazartesi = 1, Pazar = 0
  }
});
const localizer = momentLocalizer(moment);

// Custom Resource View - React Big Calendar'da resource view için özel view gerekli

interface ServicePageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ServicePage = ({ isCollapsed, setIsCollapsed }: ServicePageProps) => {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

  // Calendar state'leri
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(Views.WEEK);
  const [showCompletedServices, setShowCompletedServices] = useState(true);
  const [showResourceView, setShowResourceView] = useState(true);
  const [assignedServices, setAssignedServices] = useState<Map<string, string>>(new Map());

  const { data: serviceRequests, isLoading, error } = useServiceRequests();

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
      return data;
    },
  });

  const handleSelectRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  // Öncelik renklerini belirle
  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: '#ef4444',
      high: '#f97316',
      medium: '#eab308', 
      low: '#22c55e',
    };
    return colors[priority as keyof typeof colors] || '#6b7280';
  };

  // Test verisi - sadece atanmış servisler
  const testEvents = [
    {
      id: '1',
      title: 'Klima Bakımı',
      start: new Date(2024, 8, 10, 9, 0),
      end: new Date(2024, 8, 10, 11, 0),
      resourceId: 'tech1',
      priority: 'high',
      status: 'in_progress',
      location: 'Ofis A',
      serviceType: 'Bakım',
    },
    {
      id: '2',
      title: 'Elektrik Panosu Kontrolü',
      start: new Date(2024, 8, 10, 14, 0),
      end: new Date(2024, 8, 10, 16, 0),
      resourceId: 'tech2',
      priority: 'medium',
      status: 'assigned',
      location: 'Ofis B',
      serviceType: 'Kontrol',
    },
    {
      id: '3',
      title: 'Network Kurulumu',
      start: new Date(2024, 8, 11, 10, 0),
      end: new Date(2024, 8, 11, 12, 0),
      resourceId: 'tech3',
      priority: 'urgent',
      status: 'new',
      location: 'Yeni Ofis',
      serviceType: 'Kurulum',
    }
  ];

  const testTechnicians = [
    { id: 'tech1', first_name: 'Can', last_name: 'Öztürk' },
    { id: 'tech2', first_name: 'Zeynep', last_name: 'Arslan' },
    { id: 'tech3', first_name: 'Ahmet', last_name: 'Yılmaz' },
    { id: 'tech4', first_name: 'Mehmet', last_name: 'Kaya' },
    { id: 'tech5', first_name: 'Ali', last_name: 'Demir' },
  ];

  // Calendar events'leri oluştur
  const calendarEvents = useMemo(() => {
    const allEvents = [...testEvents];
    
    // Gerçek servis taleplerini de ekle
    if (serviceRequests && serviceRequests.length > 0) {
      const realEvents = serviceRequests.map(request => ({
        id: `real-${request.id}`,
        title: request.title || 'Servis Talebi',
        start: request.scheduled_date ? new Date(request.scheduled_date) : new Date(),
        end: request.scheduled_date ? new Date(new Date(request.scheduled_date).getTime() + 2 * 60 * 60 * 1000) : new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 saat sonra
        resourceId: request.assigned_technician_id || 'unassigned',
        priority: request.priority || 'medium',
        status: request.status || 'pending',
        location: request.location || 'Belirtilmemiş',
        serviceType: request.service_type || 'Genel',
      }));
      allEvents.push(...realEvents);
    }
    
    return allEvents
      .filter(event => showCompletedServices || event.status !== 'completed')
      .map(event => {
        // Eğer bu servis atanmışsa, assignedServices state'inden resourceId'yi al
        const assignedResourceId = assignedServices.get(event.id);
        const finalResourceId = assignedResourceId || event.resourceId;
        
        return {
          id: event.id,
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end),
          resourceId: finalResourceId,
          priority: event.priority,
          status: event.status,
          location: event.location,
          serviceType: event.serviceType,
          style: {
            backgroundColor: getPriorityColor(event.priority),
            borderColor: getPriorityColor(event.priority),
            color: 'white',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: '500',
          }
        };
      });
  }, [showCompletedServices, serviceRequests, assignedServices]);

  // Resources'ları oluştur
  const resources = useMemo(() => {
    // Veritabanından gelen teknisyenler varsa onları kullan, yoksa test verilerini kullan
    const techList = technicians && technicians.length > 0 ? technicians : testTechnicians;
    
    return techList.map(tech => ({
      resourceId: tech.id,
      title: `${tech.first_name} ${tech.last_name}`,
    }));
  }, [technicians]);

  // Event handlers
  const handleSelectEvent = useCallback((event: any) => {
    console.log('Event selected:', event);
  }, []);

  const handleEventDrop = useCallback(({ event, start, end }: any) => {
    console.log('Event moved:', event, start, end);
  }, []);

  const handleEventResize = useCallback(({ event, start, end }: any) => {
    console.log('Event resized:', event, start, end);
  }, []);

  const eventStyleGetter = useCallback((event: any) => {
    return {
      style: {
        backgroundColor: getPriorityColor(event.priority),
        borderColor: getPriorityColor(event.priority),
        color: 'white',
        borderRadius: '6px',
        border: 'none',
        fontSize: '12px',
        fontWeight: '500',
        opacity: event.status === 'completed' ? 0.7 : 1,
      }
    };
  }, []);

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
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/service/list")}
                    className="gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Liste Görünümü
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Users className="h-4 w-4" />
                    Teknisyenler
                  </Button>
                  <Button onClick={() => setIsNewRequestOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
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


            {/* React Big Calendar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                    Servis Takvimi
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                      className="ml-2"
                    >
                      <CalendarDays className="h-4 w-4 mr-1" />
                      Bugün
                    </Button>
                  </div>
                </div>

                {/* Kontrol Paneli */}
                <div className="flex items-center justify-between gap-4">
                  {/* Görünüm Seçici */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Görünüm:</span>
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      <Button
                        variant={view === Views.DAY ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setView(Views.DAY)}
                        className="h-8 px-3"
                      >
                        Gün
                      </Button>
                      <Button
                        variant={view === Views.WEEK ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setView(Views.WEEK)}
                        className="h-8 px-3"
                      >
                        Hafta
                      </Button>
                      <Button
                        variant={view === Views.MONTH ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setView(Views.MONTH)}
                        className="h-8 px-3"
                      >
                        Ay
                      </Button>
                    </div>
                  </div>

                  {/* Filtre Kontrolü */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowResourceView(!showResourceView)}
                      className={`h-8 ${showResourceView ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Teknisyen Görünümü
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCompletedServices(!showCompletedServices)}
                      className={`h-8 ${showCompletedServices ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                    >
                      {showCompletedServices ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                      Tamamlanan
                    </Button>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{resources.length} teknisyen</span>
                      <span>•</span>
                      <span>{calendarEvents.length} servis</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Gantt Style Calendar with Unassigned Services */}
              <div className="flex" style={{ height: 'calc(100vh - 200px)' }}>
                {/* Ana Takvim Alanı */}
                <div className="flex-1 flex flex-col border-r border-gray-300">
                  {/* Gün Başlıkları */}
                  <div className="flex border-b border-gray-300">
                    {/* Sol boş alan - Teknisyen başlığı için */}
                    <div className="w-48 bg-blue-600 text-white p-3 font-semibold text-sm border-r border-blue-700">
                      Teknisyenler / Günler
                    </div>
                    
                    {/* Gün sütunları */}
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = moment(currentDate).startOf('week').add(i, 'days');
                      const turkishDays = {
                        'Sunday': 'Pazar',
                        'Monday': 'Pazartesi', 
                        'Tuesday': 'Salı',
                        'Wednesday': 'Çarşamba',
                        'Thursday': 'Perşembe',
                        'Friday': 'Cuma',
                        'Saturday': 'Cumartesi'
                      };
                      const dayName = date.format('dddd');
                      const turkishDay = turkishDays[dayName as keyof typeof turkishDays] || dayName;
                      
                      return (
                        <div key={i} className="w-40 bg-gray-100 border-r border-gray-300 p-4 text-center">
                          <div className="text-xs font-medium text-gray-700">{turkishDay}</div>
                          <div className="text-sm font-semibold text-gray-900 mt-1">{date.format('DD MMM')}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Teknisyen Satırları */}
                  <div className="flex-1 overflow-y-auto">
                    {resources.map((tech, techIndex) => (
                      <div key={tech.resourceId} className="flex border-b border-gray-200 hover:bg-gray-50">
                        {/* Teknisyen İsmi */}
                        <div className="w-48 bg-gray-50 border-r border-gray-300 p-4 flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{tech.title}</p>
                            <p className="text-xs text-gray-500">Teknisyen</p>
                          </div>
                        </div>
                        
                        {/* Gün hücreleri */}
                        {Array.from({ length: 7 }, (_, i) => {
                          const date = moment(currentDate).startOf('week').add(i, 'days');
                          
                          // Bu teknisyen ve günde servis var mı kontrol et
                          const dayServices = calendarEvents.filter(event => {
                            const eventDate = moment(event.start);
                            return eventDate.isSame(date, 'day') && event.resourceId === tech.resourceId;
                          });

                          return (
                        <div 
                          key={i} 
                          className="w-40 border-r border-gray-200 p-4 min-h-24 relative hover:bg-gray-50 transition-colors"
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.backgroundColor = '';
                            e.currentTarget.style.border = '';
                            
                            const serviceData = e.dataTransfer.getData('text/plain');
                            if (serviceData) {
                              const service = JSON.parse(serviceData);
                              console.log('✅ Servis atandı:', service.title, '→ Teknisyen:', tech.title, 'Gün:', i);
                              
                              // State'i güncelle - servisi teknisyene ata
                              setAssignedServices(prev => {
                                const newMap = new Map(prev);
                                newMap.set(service.id, tech.resourceId);
                                return newMap;
                              });
                              
                              // Başarı mesajı göster
                              alert(`✅ ${service.title} servisi ${tech.title} teknisyenine atandı!`);
                              
                              // Burada gerçek atama işlemi yapılacak
                              // TODO: Supabase'e servisi teknisyene atama
                            }
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.backgroundColor = '#dbeafe';
                            e.currentTarget.style.border = '2px dashed #3b82f6';
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '';
                            e.currentTarget.style.border = '';
                          }}
                        >
                              {dayServices.map((service, serviceIndex) => (
                                <div 
                                  key={serviceIndex}
                                  className="mb-2 rounded px-3 py-2 text-xs text-white cursor-pointer"
                                  style={{ 
                                    backgroundColor: service.style?.backgroundColor || '#3b82f6',
                                    fontSize: '10px',
                                    lineHeight: '1.3'
                                  }}
                                  onClick={() => handleSelectEvent(service)}
                                >
                                  <div className="font-medium truncate">{service.title}</div>
                                  <div className="opacity-80 truncate">{service.location}</div>
                                  <div className="opacity-70 text-xs">
                                    {moment(service.start).format('HH:mm')} - {moment(service.end).format('HH:mm')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Atanmamış Servisler Sidebar */}
                <div className="w-80 bg-gray-50 flex flex-col">
                  <div className="p-4 bg-orange-600 text-white border-b border-orange-700">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Atanmamış Servisler
                    </h3>
                    <p className="text-xs opacity-90 mt-1">Teknisyenlere sürükleyip bırakın</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Atanmamış servisleri filtrele */}
                    {calendarEvents
                      .filter(event => !event.resourceId || event.resourceId === 'unassigned')
                      .map((service, index) => (
                        <div 
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-3 cursor-move hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', JSON.stringify(service));
                            e.currentTarget.style.opacity = '0.5';
                            e.currentTarget.style.transform = 'rotate(5deg)';
                          }}
                          onDragEnd={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.transform = 'rotate(0deg)';
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">{service.title}</h4>
                              {service.location && (
                                <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {service.location}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: service.style?.backgroundColor || '#3b82f6' }}
                                ></span>
                                <span className="text-xs text-gray-500">
                                  {moment(service.start).format('HH:mm')} - {moment(service.end).format('HH:mm')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-2">
                              <User className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {/* Atanmamış servis yoksa */}
                    {calendarEvents.filter(event => !event.resourceId || event.resourceId === 'unassigned').length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Tüm servisler atanmış!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Alt Bilgi Paneli */}
              <div className="bg-gray-50 border-t border-gray-200 p-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <span>Servisleri sürükleyerek farklı teknisyenlere ve zamanlara atayabilirsiniz</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span>Öncelik:</span>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span>Acil</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <span>Yüksek</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span>Orta</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span>Düşük</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

          {/* New Service Request Dialog */}
          <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Yeni Servis Talebi
                </DialogTitle>
              </DialogHeader>
              <ServiceRequestForm 
                onClose={() => setIsNewRequestOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default ServicePage;
