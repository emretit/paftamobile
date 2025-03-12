
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TasksTable from "./TasksTable";
import { Task } from "@/types/task";

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
      
      // Add the item_type field if it doesn't exist
      const tasksWithItemType = (data || []).map(task => ({
        ...task,
        item_type: task.item_type || "task"
      })) as Task[];
      
      return tasksWithItemType;
    }
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees-for-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, avatar_url")
        .eq("status", "aktif");

      if (error) throw error;
      return data || [];
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
