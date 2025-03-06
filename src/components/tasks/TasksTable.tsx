
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody } from "@/components/ui/table";
import { TaskTableHeader, TaskTableRow } from "./table";
import { useSortedTasks } from "./table/useSortedTasks";
import { useTaskOperations } from "./table/useTaskOperations";
import { useTaskRealtime } from "./hooks/useTaskRealtime";
import type { Task } from "@/types/task";
import LoadingState from "./kanban/LoadingState";

interface TasksTableProps {
  searchQuery: string;
  selectedEmployee: string | null;
  selectedType: string | null;
  onSelectTask: (task: Task) => void;
}

const TasksTable = ({ 
  searchQuery, 
  selectedEmployee, 
  selectedType, 
  onSelectTask
}: TasksTableProps) => {
  // Use the shared realtime hook
  useTaskRealtime();

  const { handleStatusChange, handleDeleteTask } = useTaskOperations();

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

  const { tasks, sortField, sortDirection, handleSort } = useSortedTasks(
    fetchedTasks,
    searchQuery,
    selectedEmployee,
    selectedType
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-red-500">Error loading tasks: {error.message}</div>
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-gray-500">No tasks found. Create your first task!</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border">
      <Table>
        <TaskTableHeader 
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
        />
        <TableBody>
          {tasks.map((task) => (
            <TaskTableRow 
              key={task.id}
              task={task}
              onSelectTask={onSelectTask}
              onStatusChange={handleStatusChange}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TasksTable;
