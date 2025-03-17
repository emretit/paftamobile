
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task, TasksState, TaskStatus } from "@/types/task";
import { mockCrmService } from "@/services/mockCrmService";

interface UseKanbanTasksParams {
  searchQuery?: string;
  selectedEmployee?: string | null;
  selectedType?: string | null;
}

export const useKanbanTasks = ({
  searchQuery = "",
  selectedEmployee = null,
  selectedType = null,
}: UseKanbanTasksParams) => {
  const [tasksState, setTasksState] = useState<TasksState>({
    todo: [],
    in_progress: [],
    completed: [],
    postponed: [],
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await mockCrmService.getTasks();
      return data || [];
    },
  });

  useEffect(() => {
    if (!data) return;

    const tasksMap: TasksState = {
      todo: [],
      in_progress: [],
      completed: [],
      postponed: [],
    };

    // Process data and handle subtasks from string format if needed
    data.forEach((task: any) => {
      const processedTask: Task = {
        ...task,
        status: task.status as TaskStatus,
        subtasks: typeof task.subtasks === 'string' 
          ? JSON.parse(task.subtasks || '[]') 
          : (task.subtasks || [])
      };

      if (tasksMap[processedTask.status]) {
        tasksMap[processedTask.status].push(processedTask);
      } else {
        tasksMap.todo.push(processedTask);
      }
    });

    setTasksState(tasksMap);
  }, [data]);

  const filterTasks = useCallback(
    (
      tasksState: TasksState,
      searchQuery?: string,
      selectedEmployee?: string | null,
      selectedType?: string | null
    ): TasksState => {
      const filtered: TasksState = {
        todo: [],
        in_progress: [],
        completed: [],
        postponed: [],
      };

      // Apply filters to each status category
      Object.entries(tasksState).forEach(([status, statusTasks]) => {
        filtered[status as keyof TasksState] = statusTasks.filter((task) => {
          // Filter by search query
          const matchesSearch =
            !searchQuery ||
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

          // Filter by employee
          const matchesEmployee = !selectedEmployee || task.assignee_id === selectedEmployee;

          // Filter by type
          const matchesType = !selectedType || task.type === selectedType;

          return matchesSearch && matchesEmployee && matchesType;
        });
      });

      return filtered;
    },
    []
  );
  
  // Apply all active filters to the tasks
  const filteredTasks = filterTasks(
    tasksState,
    searchQuery,
    selectedEmployee,
    selectedType
  );

  return { 
    tasks: filteredTasks, 
    isLoading, 
    error,
    setTasksState,
    filterTasks
  };
};
