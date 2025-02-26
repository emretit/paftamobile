
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Link as LinkIcon, Trash2, Pencil } from "lucide-react";
import { format, isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const queryClient = useQueryClient();

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
      toast.error('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  });

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-green-100 text-green-700",
    };
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      opportunity: "Fırsat",
      proposal: "Teklif",
      general: "Genel",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== "completed";

  return (
    <Card className={cn(
      "p-4 hover:shadow-md transition-shadow bg-white border-l-4",
      task.status === "completed" ? "border-l-green-500" : 
      isOverdue ? "border-l-red-500" : 
      task.priority === "high" ? "border-l-red-400" :
      task.priority === "medium" ? "border-l-yellow-400" : "border-l-green-400"
    )}>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-gray-900">{task.title}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onEdit?.(task)}
            >
              <span className="sr-only">Edit</span>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
              onClick={() => {
                if (confirm('Are you sure you want to delete this task?')) {
                  deleteTaskMutation.mutate(task.id);
                }
              }}
            >
              <span className="sr-only">Delete</span>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-600">{task.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm">
          {task.assignee && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee.avatar} />
                <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-gray-600">{task.assignee.name}</span>
            </div>
          )}

          {task.type !== 'general' && (
            <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs">
              {getTypeLabel(task.type)}
            </span>
          )}

          {task.due_date && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              isOverdue ? "text-red-600 font-medium" : "text-gray-500"
            )}>
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(task.due_date), 'dd MMM yyyy')}</span>
              {isOverdue && <span className="text-red-600 ml-1">(Gecikmiş)</span>}
            </div>
          )}

          {task.related_item_id && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <LinkIcon className="h-3 w-3" />
              <span>{task.related_item_title}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
