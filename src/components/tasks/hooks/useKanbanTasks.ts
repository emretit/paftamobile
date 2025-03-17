
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task, TasksState } from "@/types/task";
import { mockTasksAPI } from "@/services/mockCrmService";

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
  const [tasks, setTasks] = useState<TasksState>({
    todo: [],
    in_progress: [],
    completed: [],
    postponed: [],
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await mockTasksAPI.getTasks();
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

    data.forEach((task: Task) => {
      if (tasksMap[task.status]) {
        tasksMap[task.status].push(task);
      } else {
        tasksMap.todo.push(task);
      }
    });

    setTasks(tasksMap);
  }, [data]);

  const filterTasks = useCallback(
    (
      tasks: TasksState,
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
      Object.entries(tasks).forEach(([status, statusTasks]) => {
        filtered[status as keyof TasksState] = statusTasks.filter((task) => {
          // Filter by search query
          const matchesSearch =
            !searchQuery ||
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase());

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

  return { tasks, isLoading, error, filterTasks };
};
