
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Task } from "@/types/task";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: Task;
  status: string;
  priority: string;
}

export const useTaskCalendar = (
  searchQuery: string,
  selectedEmployee: string | null,
  selectedType: string | null
) => {
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

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

  // Update events when tasks or filters change
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

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsQuickViewOpen(true);
  };

  return {
    events,
    isLoading,
    error,
    selectedEvent,
    isQuickViewOpen,
    setIsQuickViewOpen,
    handleEventUpdate,
    handleSelectEvent,
    deleteTaskMutation
  };
};
