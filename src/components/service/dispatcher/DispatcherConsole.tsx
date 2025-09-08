import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Views, momentLocalizer, Event as CalendarEvent } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/tr';
import './dispatcher-console.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useServiceRequests, ServiceRequest } from '@/hooks/useServiceRequests';
import { useTechnicianNames } from '../hooks/useTechnicianNames';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, MapPin, Users, Clock, Filter } from 'lucide-react';
import { ResourceView } from './ResourceView';

// Türkçe moment lokali
moment.locale('tr');
const localizer = momentLocalizer(moment);

interface ServiceEvent extends CalendarEvent {
  id: string;
  serviceRequest: ServiceRequest;
  technician?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
}

interface DispatcherConsoleProps {
  onSelectRequest?: (request: ServiceRequest) => void;
}

const priorityColors = {
  urgent: '#ef4444', // red-500
  high: '#f97316',   // orange-500
  medium: '#eab308', // yellow-500
  low: '#22c55e',    // green-500
};

const statusColors = {
  new: '#6b7280',         // gray-500
  assigned: '#3b82f6',    // blue-500
  in_progress: '#8b5cf6', // purple-500
  completed: '#10b981',   // emerald-500
  cancelled: '#ef4444',   // red-500
  on_hold: '#f59e0b',     // amber-500
};

export const DispatcherConsole: React.FC<DispatcherConsoleProps> = ({ 
  onSelectRequest 
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'resources'>('schedule');
  const [currentView, setCurrentView] = useState<'week' | 'day' | 'agenda'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: serviceRequests } = useServiceRequests();
  const { getTechnicianName } = useTechnicianNames();

  // Servis taleplerini kalendar eventlerine dönüştür
  const events = useMemo(() => {
    if (!serviceRequests) return [];

    return serviceRequests
      .filter(request => request.due_date) // Sadece tarih belirtilmiş olanlar
      .map(request => {
        const startDate = new Date(request.due_date!);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 saat varsayılan süre

        return {
          id: request.id,
          title: request.title,
          start: startDate,
          end: endDate,
          serviceRequest: request,
          technician: request.assigned_to ? getTechnicianName(request.assigned_to) : 'Atanmamış',
          priority: request.priority,
          status: request.status,
          resource: request.assigned_to || 'unassigned',
        } as ServiceEvent;
      });
  }, [serviceRequests, getTechnicianName]);

  // Event stil özelleştirmesi
  const eventStyleGetter = useCallback((event: ServiceEvent) => {
    const priority = event.priority;
    const status = event.status;
    
    let backgroundColor = priorityColors[priority];
    let borderColor = statusColors[status];
    
    // Tamamlanan işler için opacity azalt
    if (status === 'completed') {
      backgroundColor = statusColors[status];
    }
    
    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '4px',
        opacity: status === 'completed' ? 0.7 : 1,
        color: 'white',
        fontWeight: 'bold',
        fontSize: '12px',
      },
    };
  }, []);

  // Event seçildiğinde
  const handleSelectEvent = useCallback((event: ServiceEvent) => {
    onSelectRequest?.(event.serviceRequest);
  }, [onSelectRequest]);

  // Event sürüklenip bırakıldığında (TODO: implement drag & drop)
  const handleEventDrop = useCallback((args: any) => {
    console.log('Event dropped:', args);
    // TODO: Update service request date in database
  }, []);

  // Event boyutu değiştirildiğinde (TODO: implement resize)
  const handleEventResize = useCallback((args: any) => {
    console.log('Event resized:', args);
    // TODO: Update service request duration in database
  }, []);

  const views = {
    week: Views.WEEK,
    day: Views.DAY,
    agenda: Views.AGENDA,
  };

  return (
    <div className="dispatcher-console h-full">
      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Dispatcher Console</h2>
          </div>
          
          {/* Main Tab Toggle */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Çizelgeleme
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Kaynaklar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsContent value="schedule" className="space-y-4">
            {/* Split View: Calendar + Resources */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-300px)]">
              
              {/* Calendar Section - Sol 3 kolon */}
              <div className="xl:col-span-3 space-y-4">
                {/* Calendar View Controls */}
                <div className="flex items-center justify-between">
                  <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
                    <TabsList className="bg-gray-100">
                      <TabsTrigger value="day" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Günlük
                      </TabsTrigger>
                      <TabsTrigger value="week" className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Haftalık
                      </TabsTrigger>
                      <TabsTrigger value="agenda" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Ajanda
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Filters and Legend */}
                <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Öncelik Seviyeleri:</span>
                    <div className="flex items-center gap-3">
                      {Object.entries(priorityColors).map(([priority, color]) => (
                        <div key={priority} className="flex items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs capitalize">{priority}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Durumlar:</span>
                    <div className="flex items-center gap-3">
                      {Object.entries(statusColors).slice(0, 4).map(([status, color]) => (
                        <div key={status} className="flex items-center gap-1">
                          <div 
                            className="w-3 h-3 border-2 rounded-sm" 
                            style={{ borderColor: color }}
                          />
                          <span className="text-xs">{status.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Calendar */}
                <div className="calendar-container bg-white rounded-lg" style={{ height: '600px' }}>
                  <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    titleAccessor="title"
                    views={views}
                    view={currentView}
                    onView={setCurrentView}
                    date={currentDate}
                    onNavigate={setCurrentDate}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    // onEventDrop={handleEventDrop} // TODO: Enable when implementing drag & drop
                    // onEventResize={handleEventResize} // TODO: Enable when implementing resize
                    popup
                    popupOffset={{ x: 30, y: 20 }}
                    messages={{
                      next: "Sonraki",
                      previous: "Önceki", 
                      today: "Bugün",
                      month: "Ay",
                      week: "Hafta",
                      day: "Gün",
                      agenda: "Ajanda",
                      date: "Tarih",
                      time: "Saat",
                      event: "Etkinlik",
                      noEventsInRange: "Bu tarih aralığında servis talebi bulunmuyor.",
                      showMore: (total) => `+${total} daha fazla`,
                    }}
                    formats={{
                      timeGutterFormat: 'HH:mm',
                      eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                        localizer?.format(start, 'HH:mm', culture) + ' - ' +
                        localizer?.format(end, 'HH:mm', culture),
                      agendaTimeFormat: 'HH:mm',
                      agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
                        localizer?.format(start, 'HH:mm', culture) + ' - ' +
                        localizer?.format(end, 'HH:mm', culture),
                    }}
                    components={{
                      event: ({ event }: { event: ServiceEvent }) => (
                        <div className="custom-event">
                          <div className="text-xs font-medium truncate">{event.title}</div>
                          <div className="text-xs opacity-90 truncate">{event.technician}</div>
                          <Badge variant="outline" className="text-xs px-1 py-0 bg-white/20">
                            {event.priority}
                          </Badge>
                        </div>
                      ),
                    }}
                  />
                </div>
              </div>

              {/* Resource Panel - Sağ 1 kolon */}
              <div className="xl:col-span-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Teknisyen Durumu
                  </h3>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white rounded p-2">
                      <div className="text-lg font-bold text-blue-600">
                        {events.filter(e => moment(e.start).isSame(moment(), 'day')).length}
                      </div>
                      <div className="text-xs text-gray-600">Bugün</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-lg font-bold text-orange-600">
                        {events.filter(e => e.resource === 'unassigned').length}
                      </div>
                      <div className="text-xs text-gray-600">Atanmamış</div>
                    </div>
                  </div>

                  {/* Mini Resource View */}
                  <ResourceView 
                    compact={true}
                    onAssignTask={(technicianId, serviceRequest) => {
                      console.log('Assigning task:', serviceRequest?.id, 'to technician:', technicianId);
                    }} 
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <ResourceView onAssignTask={(technicianId, serviceRequest) => {
              // TODO: Implement task assignment logic
              console.log('Assigning task:', serviceRequest.id, 'to technician:', technicianId);
            }} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
