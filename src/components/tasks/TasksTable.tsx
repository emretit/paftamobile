
import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, MoreHorizontal } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { useTaskRealtime } from "./hooks/useTaskRealtime";
import type { Task } from "@/types/task";
import LoadingState from "./kanban/LoadingState";

type SortField = "title" | "due_date" | "status" | "priority" | "assignee";
type SortDirection = "asc" | "desc";

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
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortField, setSortField] = useState<SortField>("due_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  
  // Use the shared realtime hook
  useTaskRealtime();

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

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: Task['status'] }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task status updated');
    },
    onError: (error) => {
      toast.error('Error updating task status');
      console.error('Error updating task status:', error);
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
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      toast.error('Error deleting task');
      console.error('Error deleting task:', error);
    }
  });

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
      
      // Apply sorting
      filteredTasks.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortField) {
          case "title":
            valueA = a.title.toLowerCase();
            valueB = b.title.toLowerCase();
            break;
          case "due_date":
            valueA = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
            valueB = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
            break;
          case "status":
            valueA = a.status;
            valueB = b.status;
            break;
          case "priority":
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            valueA = priorityOrder[a.priority];
            valueB = priorityOrder[b.priority];
            break;
          case "assignee":
            valueA = a.assignee?.name || "";
            valueB = b.assignee?.name || "";
            break;
          default:
            valueA = a.title.toLowerCase();
            valueB = b.title.toLowerCase();
        }
        
        const compareResult = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        return sortDirection === "asc" ? compareResult : -compareResult;
      });
      
      setTasks(filteredTasks);
    }
  }, [fetchedTasks, searchQuery, selectedEmployee, selectedType, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    
    return sortDirection === "asc" 
      ? <ChevronUp className="h-4 w-4 ml-1" />
      : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  const renderPriorityBadge = (priority: string) => {
    let color;
    let label;
    
    switch (priority) {
      case "high":
        color = "bg-red-100 text-red-700";
        label = "Yüksek";
        break;
      case "medium":
        color = "bg-yellow-100 text-yellow-700";
        label = "Orta";
        break;
      case "low":
        color = "bg-green-100 text-green-700";
        label = "Düşük";
        break;
      default:
        color = "bg-gray-100 text-gray-700";
        label = priority;
    }
    
    return <span className={`px-2 py-1 rounded-full text-xs ${color}`}>{label}</span>;
  };

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    updateTaskStatusMutation.mutate({ taskId, status });
  };

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
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort("title")}
            >
              <div className="flex items-center">
                Task Name
                {getSortIcon("title")}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort("due_date")}
            >
              <div className="flex items-center">
                Due Date
                {getSortIcon("due_date")}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort("priority")}
            >
              <div className="flex items-center">
                Priority
                {getSortIcon("priority")}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort("assignee")}
            >
              <div className="flex items-center">
                Assigned To
                {getSortIcon("assignee")}
              </div>
            </TableHead>
            <TableHead className="w-[180px]">
              Status
            </TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow 
              key={task.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onSelectTask(task)}
            >
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{task.title}</span>
                  {task.description && (
                    <span className="text-xs text-gray-500 line-clamp-1 mt-1">
                      {task.description}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {task.due_date ? (
                  <span 
                    className={cn(
                      "text-sm",
                      task.status !== "completed" && 
                      new Date(task.due_date) < new Date() && 
                      "text-red-600 font-medium"
                    )}
                  >
                    {format(new Date(task.due_date), "dd MMM yyyy")}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>{renderPriorityBadge(task.priority)}</TableCell>
              <TableCell>
                {task.assignee ? (
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignee.avatar} />
                      <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{task.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Select
                  value={task.status}
                  onValueChange={(value) => handleStatusChange(task.id, value as Task['status'])}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this task?')) {
                            deleteTaskMutation.mutate(task.id);
                          }
                        }}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TasksTable;
