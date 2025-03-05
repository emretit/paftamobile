
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import * as trLocale from 'date-fns/locale/tr'; // Import with namespace instead of default
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { useTaskRealtime } from "./hooks/useTaskRealtime";
import type { Task } from "@/types/task";
import "react-big-calendar/lib/css/react-big-calendar.css";

interface TasksCalendarProps {
  searchQuery: string;
  selectedEmployee: string | null;
  selectedType: string | null;
  onEditTask?: (task: Task) => void;
  onSelectTask?: (task: Task) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: Task;
  status: string;
  priority: string;
}

const locales = {
  'tr': trLocale,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: trLocale }),
  getDay,
  locales,
});

const TasksCalendar = ({
  searchQuery,
  selectedEmployee,
  selectedType,
  onEditTask,
  onSelectTask
}: TasksCalendarProps) => {
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  // Use the shared realtime hook
  useTaskRealtime();

  const { data: fetchedTasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      
      return tasksData.map(task => ({
        ...task,
        assignee: task.assignee ? {
          id: task.assignee.id,
          name: `${task.assignee.first_name} ${task.assignee.last_name}`,
          avatar: task.assignee.avatar_url
        } : undefined
      })) as Task[];
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, due_date }: { id: string; due_date: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ due_date })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev tarihi güncellendi');
    },
    onError: (error) => {
      toast.error('Görev güncellenirken bir hata oluştu');
      console.error('Error updating task:', error);
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev başarıyla silindi');
      setIsQuickViewOpen(false);
    },
    onError: (error) => {
      toast.error('Görev silinirken bir hata oluştu');
      console.error('Error deleting task:', error);
    }
  });

  useEffect(() => {
    if (fetchedTasks) {
      let filteredTasks = [...fetchedTasks];
      
      // Apply filters
      if (searchQuery) {
        filteredTasks = filteredTasks.filter(task => 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (selectedEmployee) {
        filteredTasks = filteredTasks.filter(task => 
          task.assignee_id === selectedEmployee
        );
      }
      
      if (selectedType) {
        filteredTasks = filteredTasks.filter(task => 
          task.type === selectedType
        );
      }
      
      // Convert to calendar events format
      const calendarEvents = filteredTasks
        .filter(task => task.due_date) // Only tasks with due dates
        .map(task => {
          const dueDate = new Date(task.due_date!);
          
          // Create end date - tasks are treated as all-day events for now
          const endDate = new Date(dueDate);
          endDate.setHours(23, 59, 59);
          
          return {
            id: task.id,
            title: task.title,
            start: dueDate,
            end: endDate,
            allDay: true,
            resource: task,
            status: task.status,
            priority: task.priority
          };
        });
      
      setEvents(calendarEvents);
    }
  }, [fetchedTasks, searchQuery, selectedEmployee, selectedType]);

  // Function to handle event updates when moved in the calendar
  const handleEventUpdate = ({ event, start, end }: any) => {
    const updatedEvents = events.map(existingEvent => {
      return existingEvent.id === event.id
        ? { ...existingEvent, start, end }
        : existingEvent;
    });
    
    setEvents(updatedEvents);
    
    // Update the task in Supabase
    updateTaskMutation.mutate({
      id: event.id,
      due_date: start.toISOString()
    });
  };

  const getEventStyle = (event: any) => {
    let backgroundColor;
    let borderColor;
    
    // Set colors based on priority
    switch (event.priority) {
      case 'high':
        backgroundColor = '#FEE2E2';
        borderColor = '#EF4444';
        break;
      case 'medium':
        backgroundColor = '#FEF3C7';
        borderColor = '#F59E0B';
        break;
      case 'low':
        backgroundColor = '#D1FAE5';
        borderColor = '#10B981';
        break;
      default:
        backgroundColor = '#E5E7EB';
        borderColor = '#6B7280';
    }
    
    // Completed tasks have a different style
    if (event.status === 'completed') {
      backgroundColor = '#F3F4F6';
      borderColor = '#9CA3AF';
    }
    
    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '4px',
        opacity: event.status === 'completed' ? 0.7 : 1,
        color: '#374151',
        fontWeight: 500,
      }
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsQuickViewOpen(true);
  };

  const handleViewTask = () => {
    if (selectedEvent && onSelectTask) {
      onSelectTask(selectedEvent.resource);
      setIsQuickViewOpen(false);
    }
  };

  const handleEditTask = () => {
    if (selectedEvent && onEditTask) {
      onEditTask(selectedEvent.resource);
      setIsQuickViewOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-red-500">Error loading tasks: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border p-4">
      <div className="h-[700px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ width: '100%', height: '100%' }}
          onEventDrop={handleEventUpdate}
          onEventResize={handleEventUpdate}
          selectable
          onSelectEvent={handleSelectEvent}
          eventPropGetter={getEventStyle}
          views={['month', 'week', 'day']}
          messages={{
            month: 'Ay',
            week: 'Hafta',
            day: 'Gün',
            today: 'Bugün',
            next: 'İleri',
            previous: 'Geri',
            showMore: (total) => `+${total} daha`,
          }}
          formats={{
            dayHeaderFormat: (date) => format(date, 'EEEE dd MMMM', { locale: trLocale }),
            dayRangeHeaderFormat: ({ start, end }) => 
              `${format(start, 'dd MMM', { locale: trLocale })} - ${format(end, 'dd MMM', { locale: trLocale })}`,
            timeGutterFormat: (date) => format(date, 'HH:mm', { locale: trLocale }),
            eventTimeRangeFormat: ({ start, end }) => 
              `${format(start, 'HH:mm', { locale: trLocale })} - ${format(end, 'HH:mm', { locale: trLocale })}`,
          }}
        />
      </div>

      <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedEvent?.resource.description && (
              <p className="text-sm text-gray-600">{selectedEvent.resource.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500">Durum</p>
                <div className="text-sm">
                  {selectedEvent?.resource.status === "todo" && "Yapılacak"}
                  {selectedEvent?.resource.status === "in_progress" && "Devam Ediyor"}
                  {selectedEvent?.resource.status === "completed" && "Tamamlandı"}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500">Öncelik</p>
                <div className="text-sm">
                  {selectedEvent?.resource.priority === "high" && "Yüksek"}
                  {selectedEvent?.resource.priority === "medium" && "Orta"}
                  {selectedEvent?.resource.priority === "low" && "Düşük"}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500">Atanan</p>
                <div className="text-sm">
                  {selectedEvent?.resource.assignee?.name || "-"}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500">Tarih</p>
                <div className="text-sm">
                  {selectedEvent?.resource.due_date && format(new Date(selectedEvent.resource.due_date), "dd MMMM yyyy", { locale: trLocale })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={handleViewTask}>
                Görüntüle
              </Button>
              <Button size="sm" onClick={handleEditTask}>
                <Pencil className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
            </div>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
                  deleteTaskMutation.mutate(selectedEvent!.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sil
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksCalendar;
