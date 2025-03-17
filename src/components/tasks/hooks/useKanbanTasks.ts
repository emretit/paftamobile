
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus, TaskType, TaskWithOverdue } from "@/types/task";

interface UseKanbanTasksProps {
  searchQuery?: string;
  selectedEmployee?: string | null;
  selectedType?: TaskType | null;
}

interface TasksState {
  todo: TaskWithOverdue[];
  in_progress: TaskWithOverdue[];
  completed: TaskWithOverdue[];
  postponed: TaskWithOverdue[];
}

export const useKanbanTasks = ({
  searchQuery = "",
  selectedEmployee = null,
  selectedType = null,
}: UseKanbanTasksProps) => {
  const [tasksState, setTasksState] = useState<TasksState>({
    todo: [],
    in_progress: [],
    completed: [],
    postponed: [],
  });

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      // Fetch tasks
      const { data: tasksData, error } = await supabase
        .from("tasks")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }

      // If we have employees referenced, fetch them separately
      const employeeIds = tasksData
        .filter(task => task.assignee_id || task.assigned_to)
        .map(task => task.assignee_id || task.assigned_to)
        .filter(Boolean);
      
      let employees = {};
      
      if (employeeIds.length > 0) {
        const { data: employeesData, error: employeesError } = await supabase
          .from("employees")
          .select("id, first_name, last_name, avatar_url")
          .in("id", employeeIds);
          
        if (employeesError) {
          console.error("Error fetching employees:", employeesError);
        } else if (employeesData) {
          employees = employeesData.reduce((acc, emp) => {
            acc[emp.id] = emp;
            return acc;
          }, {});
        }
      }

      // Transform tasks to include overdue status and ensure type property
      return tasksData.map(task => {
        const assigneeId = task.assignee_id || task.assigned_to;
        const assignee = assigneeId ? employees[assigneeId] : null;
        const dueDate = task.due_date ? new Date(task.due_date) : null;
        const isOverdue = dueDate ? dueDate < new Date() : false;
        
        return {
          ...task,
          // Make sure assignee_id is populated
          assignee_id: assigneeId,
          // Ensure type property exists
          type: (task.type || task.related_item_type || "general") as TaskType,
          isOverdue,
          assignee: assignee ? {
            id: assignee.id,
            first_name: assignee.first_name,
            last_name: assignee.last_name,
            avatar_url: assignee.avatar_url
          } : undefined
        } as TaskWithOverdue;
      });
    }
  });

  useEffect(() => {
    if (tasks) {
      // Filter tasks based on criteria
      const filteredTasks = tasks.filter(task => {
        const matchesSearch = !searchQuery || 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description || "").toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesEmployee = !selectedEmployee || 
          task.assignee_id === selectedEmployee || 
          task.assigned_to === selectedEmployee;
        
        const matchesType = !selectedType || task.type === selectedType;
        
        return matchesSearch && matchesEmployee && matchesType;
      });

      // Group tasks by status
      const groupedTasks: TasksState = {
        todo: [],
        in_progress: [],
        completed: [],
        postponed: [],
      };

      filteredTasks.forEach(task => {
        const status = task.status as TaskStatus;
        if (groupedTasks[status]) {
          groupedTasks[status].push(task);
        } else {
          // Default to todo for any unrecognized status
          groupedTasks.todo.push(task);
        }
      });

      setTasksState(groupedTasks);
    }
  }, [tasks, searchQuery, selectedEmployee, selectedType]);

  return {
    tasks: tasksState,
    setTasksState,
    isLoading,
    error
  };
};

export default useKanbanTasks;
