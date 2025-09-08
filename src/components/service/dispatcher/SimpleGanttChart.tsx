import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarDays, Users, Clock, MapPin, ChevronLeft, ChevronRight, Calendar, Eye, EyeOff, Filter, MoreHorizontal, Play, Pause, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { ServiceRequest } from '@/hooks/useServiceRequests';
import moment from 'moment';
import 'moment/locale/tr';

moment.locale('tr');

interface GanttTask {
  id: string;
  title: string;
  start: Date;
  end: Date;
  serviceRequest: ServiceRequest;
  technician?: string;
  priority: string;
  status: string;
  technicianId?: string;
}

interface SimpleGanttChartProps {
  tasks: GanttTask[];
  technicians: any[];
  onTaskSelect?: (task: GanttTask) => void;
  onTaskMove?: (taskId: string, newStart: Date, technicianId: string) => void;
  selectedTasks?: string[];
  onTaskToggle?: (taskId: string) => void;
  onSelectAll?: (selectAll: boolean) => void;
  showSelection?: boolean;
}

export const SimpleGanttChart: React.FC<SimpleGanttChartProps> = ({
  tasks,
  technicians,
  onTaskSelect,
  onTaskMove,
  selectedTasks = [],
  onTaskToggle,
  onSelectAll,
  showSelection = false
}) => {
  const [currentDate, setCurrentDate] = useState(moment().startOf('week'));
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'month'>('week');
  const [showCompleted, setShowCompleted] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1.2); // Haftalık görünüm için daha iyi başlangıç
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number; task: GanttTask | null }>({ x: 0, y: 0, task: null });
  const ganttRef = useRef<HTMLDivElement>(null);

  // Görünüm moduna göre günleri oluştur
  const displayDays = useMemo(() => {
    const days = [];
    if (viewMode === 'day') {
      days.push(moment(currentDate));
    } else if (viewMode === 'week') {
      // Haftalık görünümde 7 gün
      for (let i = 0; i < 7; i++) {
        days.push(moment(currentDate).add(i, 'days'));
      }
    } else if (viewMode === 'month') {
      const startOfMonth = moment(currentDate).startOf('month');
      const endOfMonth = moment(currentDate).endOf('month');
      const startWeek = startOfMonth.startOf('week');
      const endWeek = endOfMonth.endOf('week');
      
      let current = startWeek;
      while (current.isSameOrBefore(endWeek, 'day')) {
        days.push(moment(current));
        current.add(1, 'day');
      }
    }
    return days;
  }, [currentDate, viewMode]);

  // Zoom seviyesine göre minimum genişlik hesapla
  const getMinWidth = useCallback((baseWidth: number) => {
    if (viewMode === 'day') {
      return Math.max(200, baseWidth * zoomLevel);
    } else if (viewMode === 'week') {
      return Math.max(120, baseWidth * zoomLevel);
    } else {
      return Math.max(80, baseWidth * zoomLevel);
    }
  }, [viewMode, zoomLevel]);

  // Saat dilimlerini oluştur (8:00 - 18:00)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      slots.push(hour);
    }
    return slots;
  }, []);

  // Filtrelenmiş görevler
  const filteredTasks = useMemo(() => {
    if (showCompleted) return tasks;
    return tasks.filter(task => task.status !== 'completed');
  }, [tasks, showCompleted]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            setZoomLevel(prev => Math.min(2, prev + 0.1));
            break;
          case '-':
            e.preventDefault();
            setZoomLevel(prev => Math.max(0.5, prev - 0.1));
            break;
          case '0':
            e.preventDefault();
            setZoomLevel(1);
            break;
          case 'h':
            e.preventDefault();
            setShowLegend(prev => !prev);
            break;
          case 'c':
            e.preventDefault();
            setShowCompleted(prev => !prev);
            break;
        }
      }
      
      if (e.key === 'Escape') {
        setSelectedTasks([]);
        setHoveredTask(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Enhanced drag and drop
  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    const task = filteredTasks.find(t => t.id === taskId);
    if (task) {
      setDraggedTask(taskId);
      setIsDragging(true);
      setDragPreview({ x: e.clientX, y: e.clientY, task });
      e.dataTransfer.setData('text/plain', taskId);
      e.dataTransfer.effectAllowed = 'move';
      
      // Create custom drag image
      const dragImage = document.createElement('div');
      dragImage.innerHTML = `
        <div style="
          background: linear-gradient(135deg, ${priorityColors[task.priority as keyof typeof priorityColors]} 0%, ${priorityColors[task.priority as keyof typeof priorityColors]}dd 100%);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 2px solid ${statusColors[task.status as keyof typeof statusColors]};
          max-width: 200px;
        ">
          ${task.title}
        </div>
      `;
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  }, [filteredTasks, priorityColors, statusColors]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, day: moment.Moment, hour: number, technicianId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    
    if (taskId && onTaskMove) {
      const newStart = moment(day).hour(hour).minute(0).toDate();
      onTaskMove(taskId, newStart, technicianId);
    }
    
    setDraggedTask(null);
    setIsDragging(false);
    setDragPreview({ x: 0, y: 0, task: null });
  }, [onTaskMove]);

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
    setIsDragging(false);
    setDragPreview({ x: 0, y: 0, task: null });
  }, []);

  // Clean Teknisyen satırlarını render et
  const renderTechnicianRow = (technician: any) => {
    const techTasks = filteredTasks.filter(task => task.technicianId === technician.id);
    const completedTasks = techTasks.filter(task => task.status === 'completed').length;
    const totalTasks = techTasks.length;

    return (
      <div key={technician.id} className="flex border-b border-gray-100 hover:bg-gray-50 transition-colors min-h-[48px]">
        {/* Clean Teknisyen ismi */}
        <div className="bg-white p-3 border-r border-gray-200 sticky left-0 z-10 flex items-center gap-2 min-w-[240px] w-[240px]">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {technician.first_name?.[0]}{technician.last_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-900 truncate">
              {technician.first_name} {technician.last_name}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{totalTasks} görev</span>
              {totalTasks > 0 && (
                <>
                  <span>•</span>
                  <span className="text-green-600">{completedTasks} tamamlandı</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Clean Timeline Grid with Drop Zones */}
        <div className="flex flex-1 overflow-x-auto">
          {displayDays.map((day) => {
            const dayTasks = techTasks.filter(task => 
              moment(task.start).isSame(day, 'day')
            );

            return (
              <div 
                key={day.format('YYYY-MM-DD')} 
                className="flex-1 border-r border-gray-100 p-2 relative min-h-[48px] hover:bg-blue-50 transition-colors cursor-pointer technician-drop-zone"
                style={{ minWidth: getMinWidth(120) }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day, 9, technician.id)} // Default 9 AM
                title={`${day.format('DD MMM')} - ${technician.first_name} ${technician.last_name} (Sürükle & Bırak)`}
              >
                <div className="space-y-1">
                  {dayTasks.length > 0 ? (
                    dayTasks.map((task) => (
                      <TooltipProvider key={task.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`relative rounded px-2 py-1 text-xs font-medium cursor-pointer transition-all duration-200 ${
                                selectedTasks.includes(task.id) ? 'ring-1 ring-blue-500' : ''
                              } ${hoveredTask === task.id ? 'scale-102 shadow-md' : ''} ${
                                task.status === 'completed' ? 'opacity-75' : ''
                              }`}
                              style={{
                                backgroundColor: priorityColors[task.priority as keyof typeof priorityColors],
                                color: 'white',
                                borderLeft: `3px solid ${statusColors[task.status as keyof typeof statusColors]}`,
                              }}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id)}
                              onDragEnd={handleDragEnd}
                              onMouseEnter={() => setHoveredTask(task.id)}
                              onMouseLeave={() => setHoveredTask(null)}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (showSelection && onTaskToggle) {
                                  onTaskToggle(task.id);
                                } else {
                                  onTaskSelect?.(task);
                                }
                              }}
                            >
                              <div className="flex items-center gap-1">
                                {showSelection && (
                                  <input
                                    type="checkbox"
                                    checked={selectedTasks.includes(task.id)}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      onTaskToggle?.(task.id);
                                    }}
                                    className="mr-1 h-2 w-2"
                                  />
                                )}
                                {task.status === 'completed' && <CheckCircle2 className="h-3 w-3 flex-shrink-0" />}
                                {task.status === 'in_progress' && <Play className="h-3 w-3 flex-shrink-0" />}
                                {task.status === 'on_hold' && <Pause className="h-3 w-3 flex-shrink-0" />}
                                {task.status === 'cancelled' && <XCircle className="h-3 w-3 flex-shrink-0" />}
                                <span className="truncate text-xs">{task.title}</span>
                              </div>
                              <div className="text-xs opacity-75 mt-1">
                                {moment(task.start).format('HH:mm')}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="space-y-1">
                              <div className="font-semibold">{task.title}</div>
                              <div className="text-sm text-gray-300">
                                <div>Teknisyen: {task.technician || 'Atanmamış'}</div>
                                <div>Öncelik: {task.priority}</div>
                                <div>Durum: {task.status}</div>
                                <div>Saat: {moment(task.start).format('HH:mm')} - {moment(task.end).format('HH:mm')}</div>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 text-xs py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Görevleri buraya sürükleyin
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="gantt-container" ref={ganttRef}>
      {/* Modern Gantt Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 bg-white border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (viewMode === 'day') {
                  setCurrentDate(moment(currentDate).subtract(1, 'day'));
                } else if (viewMode === 'week') {
                  setCurrentDate(moment(currentDate).subtract(1, 'week'));
                } else {
                  setCurrentDate(moment(currentDate).subtract(1, 'month'));
                }
              }}
              className="hover:bg-blue-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (viewMode === 'day') {
                  setCurrentDate(moment(currentDate).add(1, 'day'));
                } else if (viewMode === 'week') {
                  setCurrentDate(moment(currentDate).add(1, 'week'));
                } else {
                  setCurrentDate(moment(currentDate).add(1, 'month'));
                }
              }}
              className="hover:bg-blue-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              Gün
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Hafta
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Ay
            </Button>
          </div>

          <h3 className="font-semibold text-gray-800 ml-4">
            {viewMode === 'day' 
              ? currentDate.format('DD MMMM YYYY')
              : viewMode === 'week'
              ? `${currentDate.format('DD MMM')} - ${moment(currentDate).add(6, 'days').format('DD MMM YYYY')}`
              : currentDate.format('MMMM YYYY')
            }
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
              disabled={zoomLevel <= 0.5}
              className="h-8 w-8 p-0"
            >
              -
            </Button>
            <span className="text-xs text-gray-600 min-w-[3rem] text-center px-2">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
              disabled={zoomLevel >= 2}
              className="h-8 w-8 p-0"
            >
              +
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCompleted(!showCompleted)}
            className={showCompleted ? 'bg-green-50 text-green-700' : ''}
            title="Ctrl+C ile aç/kapat"
          >
            {showCompleted ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
            Tamamlanan
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLegend(!showLegend)}
            title="Ctrl+H ile aç/kapat"
          >
            <Filter className="h-4 w-4 mr-1" />
            {showLegend ? 'Gizle' : 'Göster'}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setCurrentDate(moment().startOf('week'))}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Bugün
          </Button>
        </div>
      </div>

      {/* Clean Timeline Header */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <div className="bg-white p-3 border-r border-gray-200 font-medium text-gray-700 flex items-center gap-2 min-w-[240px] w-[240px]">
          {showSelection && (
            <input
              type="checkbox"
              checked={selectedTasks.length === tasks.length && tasks.length > 0}
              ref={(el) => {
                if (el) el.indeterminate = selectedTasks.length > 0 && selectedTasks.length < tasks.length;
              }}
              onChange={(e) => onSelectAll?.(e.target.checked)}
              className="mr-2 h-3 w-3"
            />
          )}
          <Users className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">Teknisyenler</span>
        </div>
        <div className="flex flex-1 overflow-x-auto">
          {displayDays.map((day) => (
            <div 
              key={day.format('YYYY-MM-DD')} 
              className={`flex-1 p-2 border-r border-gray-200 text-center ${day.isSame(moment(), 'day') ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
              style={{ minWidth: getMinWidth(120) }}
            >
              <div className="text-xs font-medium text-gray-600">{day.format('ddd')}</div>
              <div className="text-sm font-bold text-gray-900">{day.format('DD')}</div>
              <div className="text-xs text-gray-500">{day.format('MMM')}</div>
              {day.isSame(moment(), 'day') && (
                <div className="text-xs text-blue-600 font-bold mt-1">•</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Time Reference */}
      <div className="flex border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
        <div className="min-w-[240px] w-[240px] p-2 border-r border-gray-200">
          <span className="font-medium">İş Saatleri: 08:00 - 18:00</span>
        </div>
        <div className="flex flex-1 overflow-x-auto">
          {displayDays.map((day) => (
            <div 
              key={`time-${day.format('YYYY-MM-DD')}`} 
              className="flex-1 border-r border-gray-100 text-center py-1"
              style={{ minWidth: getMinWidth(120) }}
            >
              <span className="text-xs text-gray-400">08:00 - 18:00</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gantt Body */}
      <div className="gantt-body overflow-auto" style={{ maxHeight: '70vh', minHeight: '400px' }}>
        {technicians.map(renderTechnicianRow)}
        
      </div>

      {/* Simple Legend */}
      {showLegend && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Öncelik:</span>
                <div className="flex gap-2">
                  {Object.entries(priorityColors).map(([priority, color]) => (
                    <div key={priority} className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-gray-600 capitalize">{priority}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Durum:</span>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-gray-600">Tamamlandı</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Play className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-gray-600">Devam Ediyor</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Pause className="h-3 w-3 text-yellow-600" />
                    <span className="text-xs text-gray-600">Beklemede</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              <div>Ctrl+C: Tamamlananları Gizle • Ctrl+H: Bu Açıklamayı Gizle • Sürükle-Bırak ile Ata</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
