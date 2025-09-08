import React, { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, Clock, MapPin, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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

  // Haftanın günlerini oluştur
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(moment(currentDate).add(i, 'days'));
    }
    return days;
  }, [currentDate]);

  // Saat dilimlerini oluştur (8:00 - 18:00)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      slots.push(hour);
    }
    return slots;
  }, []);

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

  // Görev sürükleme işlemleri
  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, day: moment.Moment, hour: number, technicianId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    
    if (taskId && onTaskMove) {
      const newStart = moment(day).hour(hour).minute(0).toDate();
      onTaskMove(taskId, newStart, technicianId);
    }
    setDraggedTask(null);
  }, [onTaskMove]);

  // Teknisyen satırlarını render et
  const renderTechnicianRow = (technician: any) => {
    const techTasks = tasks.filter(task => task.technicianId === technician.id);

    return (
      <div key={technician.id} className="gantt-technician-row border-b border-gray-200">
        {/* Teknisyen ismi */}
        <div className="gantt-technician-name bg-gray-50 p-3 border-r border-gray-200 sticky left-0 z-10">
          <div className="font-medium text-sm text-gray-900">
            {technician.name} {technician.surname}
          </div>
          <div className="text-xs text-gray-500">
            {techTasks.length} görev
          </div>
        </div>

        {/* Haftalık grid */}
        <div className="gantt-timeline-grid flex">
          {weekDays.map((day) => (
            <div key={day.format('YYYY-MM-DD')} className="gantt-day-column border-r border-gray-100" style={{ width: '200px' }}>
              {timeSlots.map((hour) => {
                const cellDateTime = moment(day).hour(hour);
                const cellTasks = techTasks.filter(task => {
                  const taskStart = moment(task.start);
                  return taskStart.isSame(cellDateTime, 'hour') && taskStart.isSame(cellDateTime, 'day');
                });

                return (
                  <div
                    key={`${day.format('YYYY-MM-DD')}-${hour}`}
                    className="gantt-time-cell h-8 border-b border-gray-50 relative hover:bg-blue-50 transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day, hour, technician.id)}
                  >
                    {cellTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`gantt-task-bar absolute inset-0 m-0.5 rounded text-white text-xs font-medium flex items-center px-2 cursor-pointer hover:shadow-md transition-shadow ${
                          selectedTasks.includes(task.id) ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                        }`}
                        style={{
                          backgroundColor: priorityColors[task.priority as keyof typeof priorityColors],
                          borderLeft: `3px solid ${statusColors[task.status as keyof typeof statusColors]}`,
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (showSelection && onTaskToggle) {
                            onTaskToggle(task.id);
                          } else {
                            onTaskSelect?.(task);
                          }
                        }}
                        title={`${task.title} - ${task.technician}`}
                      >
                        {showSelection && (
                          <input
                            type="checkbox"
                            checked={selectedTasks.includes(task.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              onTaskToggle?.(task.id);
                            }}
                            className="mr-2 h-3 w-3"
                          />
                        )}
                        <span className="truncate">{task.title}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="simple-gantt-chart h-full">
      {/* Header */}
      <div className="gantt-header flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(moment(currentDate).subtract(1, 'week'))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold text-gray-800">
            {currentDate.format('DD MMMM YYYY')} - {moment(currentDate).add(6, 'days').format('DD MMMM YYYY')}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(moment(currentDate).add(1, 'week'))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={() => setCurrentDate(moment().startOf('week'))}
        >
          Bugün
        </Button>
      </div>

      {/* Timeline Header */}
      <div className="gantt-timeline-header flex border-b-2 border-gray-300">
        <div className="gantt-technician-header bg-gray-100 p-3 border-r border-gray-200 font-medium text-gray-800 flex items-center gap-2" style={{ width: '200px' }}>
          {showSelection && (
            <input
              type="checkbox"
              checked={selectedTasks.length === tasks.length && tasks.length > 0}
              ref={(el) => {
                if (el) el.indeterminate = selectedTasks.length > 0 && selectedTasks.length < tasks.length;
              }}
              onChange={(e) => onSelectAll?.(e.target.checked)}
              className="mr-2"
            />
          )}
          Teknisyen
        </div>
        <div className="gantt-days-header flex flex-1">
          {weekDays.map((day) => (
            <div key={day.format('YYYY-MM-DD')} className="gantt-day-header bg-gray-100 p-2 border-r border-gray-200 text-center" style={{ width: '200px' }}>
              <div className="font-medium text-gray-800">{day.format('ddd')}</div>
              <div className="text-sm text-gray-600">{day.format('DD/MM')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Scale Header */}
      <div className="gantt-time-scale-header flex border-b border-gray-200">
        <div className="gantt-technician-placeholder" style={{ width: '200px' }}></div>
        <div className="gantt-time-scale flex flex-1">
          {weekDays.map((day) => (
            <div key={`time-${day.format('YYYY-MM-DD')}`} className="gantt-day-time-scale border-r border-gray-100" style={{ width: '200px' }}>
              <div className="flex text-xs text-gray-500 bg-gray-50">
                {timeSlots.slice(0, 5).map((hour) => (
                  <div key={hour} className="flex-1 text-center py-1 border-r border-gray-100">
                    {hour}:00
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gantt Body */}
      <div className="gantt-body overflow-auto" style={{ maxHeight: '500px' }}>
        {technicians.map(renderTechnicianRow)}
        
        {/* Atanmamış görevler satırı */}
        <div className="gantt-unassigned-row border-b border-gray-200 bg-orange-50">
          <div className="gantt-technician-name bg-orange-100 p-3 border-r border-gray-200 sticky left-0 z-10">
            <div className="font-medium text-sm text-orange-800">
              <Users className="h-4 w-4 inline mr-2" />
              Atanmamış Görevler
            </div>
            <div className="text-xs text-orange-600">
              {tasks.filter(task => !task.technicianId).length} görev
            </div>
          </div>
          <div className="gantt-timeline-grid flex">
            {weekDays.map((day) => (
              <div key={`unassigned-${day.format('YYYY-MM-DD')}`} className="gantt-day-column border-r border-gray-100" style={{ width: '200px' }}>
                <div className="p-2 min-h-16">
                  {tasks
                    .filter(task => !task.technicianId && moment(task.start).isSame(day, 'day'))
                    .map((task) => (
                      <div
                        key={task.id}
                        className="gantt-unassigned-task mb-1 p-2 bg-white border border-orange-200 rounded text-xs cursor-move hover:bg-orange-50 transition-colors"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => onTaskSelect?.(task)}
                      >
                        <div className="font-medium text-gray-800 truncate">{task.title}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {moment(task.start).format('HH:mm')}
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs mt-1"
                          style={{
                            borderColor: priorityColors[task.priority as keyof typeof priorityColors],
                            color: priorityColors[task.priority as keyof typeof priorityColors]
                          }}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="gantt-legend flex items-center justify-between mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Öncelik:</span>
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
          <span className="text-sm font-medium">Durum:</span>
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
    </div>
  );
};
