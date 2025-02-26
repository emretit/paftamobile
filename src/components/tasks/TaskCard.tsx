
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "completed";
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  priority: "low" | "medium" | "high";
  type: "opportunity" | "proposal" | "general";
  relatedItemId?: string;
  relatedItemTitle?: string;
}

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
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

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        
        <p className="text-sm text-gray-600">{task.description}</p>

        <div className="flex items-center justify-between">
          {task.assignee && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee.avatar} />
                <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">{task.assignee.name}</span>
            </div>
          )}
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
            {getTypeLabel(task.type)}
          </span>
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(task.dueDate), 'dd MMM yyyy')}</span>
          </div>
        )}

        {task.relatedItemId && (
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <LinkIcon className="h-3 w-3" />
            <span>{task.relatedItemTitle}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TaskCard;
