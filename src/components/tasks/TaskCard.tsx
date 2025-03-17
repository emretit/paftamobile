
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
  onSelect?: (task: Task) => void;
}

const TaskCard = ({ task, onEdit, onSelect }: TaskCardProps) => {
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
      toast.success('Görev başarıyla silindi');
    },
    onError: (error) => {
      toast.error('Görev silinirken bir hata oluştu');
      console.error('Error deleting task:', error);
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100/80 text-red-700";
      case "medium":
        return "bg-[#FEF7CD] text-yellow-700";
      case "low":
        return "bg-[#F2FCE2] text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      opportunity: "Fırsat",
      proposal: "Teklif",
      general: "Genel",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-l-[#9b87f5]";
      case "in_progress":
        return "border-l-[#0EA5E9]";
      default:
        return "border-l-gray-300";
    }
  };

  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== "completed";

  return (
    <Card 
      className={cn(
        "p-4 hover:shadow-md transition-all duration-200 bg-white border border-border/50 hover:border-[#9b87f5]/30 group cursor-pointer",
        getStatusColor(task.status)
      )}
      onClick={() => onSelect?.(task)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <div onClick={(e) => e.stopPropagation()} className="cursor-pointer">
              <h3 className="font-medium text-gray-900 group-hover:text-[#9b87f5] transition-colors">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
              )}
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
            {task.priority === "high" ? "Yüksek" : task.priority === "medium" ? "Orta" : "Düşük"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-2">
          {task.assignee && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee.avatar_url} />
                <AvatarFallback>
                  {task.assignee.first_name?.[0]}
                  {task.assignee.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">
                {task.assignee.first_name} {task.assignee.last_name}
              </span>
            </div>
          )}

          {task.type !== 'general' && (
            <span className="inline-flex items-center px-2 py-1 bg-[#F1F0FB] text-[#7E69AB] rounded-full text-xs font-medium">
              {getTypeLabel(task.type)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
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

          <div className="flex items-center gap-2">
            {task.related_item_id && (
              <div className="flex items-center gap-1 text-xs text-[#9b87f5]">
                <LinkIcon className="h-3 w-3" />
                <span>{task.related_item_title}</span>
              </div>
            )}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-[#F1F0FB] hover:text-[#9b87f5]"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(task);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
                    deleteTaskMutation.mutate(task.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
