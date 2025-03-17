
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TasksTable from "./TasksTable";
import type { Task, TaskType, TaskWithOverdue } from "@/types/task";
import { useTaskRealtime } from "./hooks/useTaskRealtime";

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
  // Use the realtime hook to listen for task changes
  useTaskRealtime();

  const { data, isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      // First, fetch tasks without the join
      const { data: tasksData, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }
      
      // If we have employees referenced, fetch them separately
      const employeeIds = tasksData
        .filter(task => task.assignee_id || task.assigned_to)
        .map(task => task.assignee_id || task.assigned_to)
        .filter(Boolean) as string[];
      
      let employees: Record<string, any> = {};
      
      if (employeeIds.length > 0) {
        const { data: employeesData, error: employeesError } = await supabase
          .from("employees")
          .select("id, first_name, last_name, avatar_url")
          .in("id", employeeIds);
          
        if (employeesError) {
          console.error("Error fetching employees:", employeesError);
        } else if (employeesData) {
          employees = employeesData.reduce((acc: Record<string, any>, emp: any) => {
            acc[emp.id] = emp;
            return acc;
          }, {});
        }
      }

      // Process due dates to check for overdue tasks
      const now = new Date();
      
      // Map tasks with their assignees and ensure they have the required type property
      return tasksData.map((task: any) => {
        // Create a normalized task object with all required properties
        const normalizedTask = {
          ...task,
          // Always ensure assignee_id exists
          assignee_id: task.assignee_id || task.assigned_to,
          // Always ensure type property exists
          type: (task.type || task.related_item_type || "general") as TaskType
        };
        
        const assigneeId = normalizedTask.assignee_id;
        const assignee = assigneeId ? employees[assigneeId] : null;
        const dueDate = normalizedTask.due_date ? new Date(normalizedTask.due_date) : null;
        const isOverdue = dueDate ? dueDate < now : false;
        
        return {
          ...normalizedTask,
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
