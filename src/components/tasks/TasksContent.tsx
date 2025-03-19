
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TasksTable } from "./table";
import TaskDetailPanel from "./TaskDetailPanel";
import type { Task } from "@/types/task";

interface TasksContentProps {
  searchQuery: string;
  selectedEmployee: string | null;
  selectedType: string | null;
  onSelectTask?: (task: Task) => void;
}

const TasksContent = ({ 
  searchQuery, 
  selectedEmployee, 
  selectedType,
  onSelectTask 
}: TasksContentProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          assignee:assignee_id(
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }

      // Transform the data to match the Task type
      return (data || []).map(task => ({
        ...task,
        assignee: task.assignee ? {
          id: task.assignee.id,
          first_name: task.assignee.first_name,
          last_name: task.assignee.last_name,
          avatar_url: task.assignee.avatar_url
        } : undefined
      })) as Task[];
    },
  });

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
    if (onSelectTask) {
      onSelectTask(task);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedTask(null);
  };

  return (
    <div>
      <TasksTable
        tasks={tasks}
        isLoading={isLoading}
        onSelectTask={handleSelectTask}
        searchQuery={searchQuery}
        selectedEmployee={selectedEmployee}
        selectedType={selectedType}
      />

      <TaskDetailPanel
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
};

export default TasksContent;
