
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Task, TaskType } from "@/types/task";

export const useKanbanTasks = (
  searchQuery: string,
  selectedEmployee: string | null,
  selectedType: string | null
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", searchQuery, selectedEmployee, selectedType],
    queryFn: async () => {
      // First, build the base query with filters
      let query = supabase.from('tasks').select('*');

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (selectedEmployee) {
        query = query.eq('assignee_id', selectedEmployee);
      }

      if (selectedType) {
        // Check if selectedType is a valid task type
        const validTypes: TaskType[] = [
          'general', 'meeting', 'follow_up', 'call', 'email', 'opportunity', 'proposal'
        ];
        if (validTypes.includes(selectedType as TaskType)) {
          query = query.eq('type', selectedType as TaskType);
        }
      }

      const { data: tasksData, error } = await query;
      
      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }
      
      // If we have employees referenced, fetch them separately
      const assigneeIds = tasksData
        .filter(task => task.assignee_id)
        .map(task => task.assignee_id);
      
      let employees = {};
      
      if (assigneeIds.length > 0) {
        const { data: employeesData, error: employeesError } = await supabase
          .from("employees")
          .select("id, first_name, last_name, avatar_url")
          .in("id", assigneeIds);
          
        if (employeesError) {
          console.error("Error fetching employees:", employeesError);
        } else if (employeesData) {
          employees = employeesData.reduce((acc, emp) => {
            acc[emp.id] = {
              id: emp.id,
              first_name: emp.first_name,
              last_name: emp.last_name,
              avatar_url: emp.avatar_url
            };
            return acc;
          }, {});
        }
      }

      // Map tasks with their assignees and parse subtasks if stored as JSON string
      return tasksData.map(task => {
        let parsedSubtasks;
        if (task.subtasks && typeof task.subtasks === 'string') {
          try {
            parsedSubtasks = JSON.parse(task.subtasks);
          } catch (e) {
            console.error('Error parsing subtasks JSON:', e);
            parsedSubtasks = [];
          }
        }

        return {
          ...task,
          item_type: 'task',
          subtasks: parsedSubtasks || task.subtasks,
          assignee: task.assignee_id ? employees[task.assignee_id] : undefined
        } as Task;
      });
    }
  });

  useEffect(() => {
    if (data) {
      setTasks(data);
    }
  }, [data]);

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Task['status'] }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev durumu güncellendi');
    },
    onError: (error) => {
      toast.error('Görev güncellenirken bir hata oluştu');
      console.error('Error updating task:', error);
    }
  });

  const filterTasks = useCallback((status: string) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  return {
    tasks,
    setTasks,
    isLoading,
    error,
    filterTasks,
    updateTaskMutation
  };
};
