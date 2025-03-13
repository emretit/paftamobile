
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TasksTable from "./TasksTable";
import type { Task } from "@/types/task";

interface TasksContentProps {
  searchQuery?: string;
  selectedEmployee?: string;
  selectedType?: string;
  onSelectTask?: (task: Task) => void;
}

const TasksContent = ({
  searchQuery = "",
  selectedEmployee = "",
  selectedType = "",
  onSelectTask = () => {}
}: TasksContentProps) => {
  const { data, isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          assignee:assignee_id(id, first_name, last_name, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Convert to Task type with explicit type casting and add item_type if not present
      return (data || []).map(task => ({
        ...task,
        // Add item_type based on type field if it doesn't exist
        item_type: task.type || "task" // Use the task's type or default to "task"
      })) as unknown as Task[];
    }
  });

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-6">
        <TasksTable
          tasks={data || []}
          isLoading={isTasksLoading}
          onSelectTask={onSelectTask}
          searchQuery={searchQuery}
          selectedEmployee={selectedEmployee}
          selectedType={selectedType}
        />
      </div>
    </div>
  );
};

export default TasksContent;
