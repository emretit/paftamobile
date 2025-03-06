
import { format } from "date-fns";
import { tr } from 'date-fns/locale/tr';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types/task";

interface TaskQuickViewProps {
  task: Task;
  anchor: HTMLElement | null;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onSelect?: (task: Task) => void;
  onClose: () => void;
}

const TaskQuickView = ({ 
  task, 
  anchor, 
  onEdit, 
  onDelete, 
  onSelect,
  onClose 
}: TaskQuickViewProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'todo':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'in_progress': return 'Devam Ediyor';
      case 'todo': return 'Yapılacak';
      default: return status;
    }
  };

  const formatDueDate = (date: string) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: tr });
  };

  if (!anchor) return null;
  
  const handleTaskSelect = () => {
    if (onSelect) {
      onSelect(task);
    }
    onClose();
  };

  return (
    <Popover open={true} onOpenChange={onClose}>
      <PopoverTrigger asChild>
        <div className="hidden">Trigger</div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="start" 
        side="right" 
        sideOffset={5}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle 
              className="text-lg cursor-pointer hover:text-blue-600"
              onClick={handleTaskSelect}
            >
              {task.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(task.status)}>
                {getStatusText(task.status)}
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority === 'high' ? 'Yüksek' : 
                  task.priority === 'medium' ? 'Orta' : 'Düşük'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            {task.description && (
              <CardDescription className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                {task.description}
              </CardDescription>
            )}
            {task.due_date && (
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium">Son Tarih:</span> {formatDueDate(task.due_date)}
              </div>
            )}
            {task.assignee && (
              <div className="mt-3 flex items-center">
                <span className="text-sm text-gray-600 mr-2">Atanan:</span>
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={task.assignee.avatar} />
                    <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{task.assignee.name}</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <div className="flex gap-2">
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { 
                    onEdit(task);
                    onClose();
                  }}
                >
                  <Pencil className="h-4 w-4 mr-1" /> 
                  Düzenle
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if(confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
                      onDelete(task.id);
                      onClose();
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> 
                  Sil
                </Button>
              )}
            </div>
            <Button 
              size="sm"
              onClick={handleTaskSelect}
            >
              Detaylar
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default TaskQuickView;
