
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '@/types/task';
import { getTaskStatusColor, getPriorityColor } from '@/components/deals/utils/colorUtils';

interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
  onSelect?: () => void;
}

const TaskCard = ({ task, onEdit, onSelect }: TaskCardProps) => {
  const handleClick = () => {
    if (onSelect) onSelect();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  return (
    <Card 
      className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardHeader className="p-3 pb-1">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
          <div className="flex gap-1">
            <Badge 
              variant="secondary"
              className={getTaskStatusColor(task.status)}
            >
              {task.status === 'todo' ? 'Yapılacak' : 
               task.status === 'in_progress' ? 'Devam Ediyor' : 
               task.status === 'completed' ? 'Tamamlandı' : 'Ertelendi'}
            </Badge>
            <Badge
              variant="outline"
              className={getPriorityColor(task.priority)}
            >
              {task.priority === 'low' ? 'Düşük' :
               task.priority === 'medium' ? 'Orta' : 'Yüksek'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        {task.description && (
          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
        )}
        <div className="flex items-center text-xs text-muted-foreground">
          {task.due_date && (
            <div className="flex items-center mr-3">
              <CalendarIcon className="h-3 w-3 mr-1" />
              <span>{format(new Date(task.due_date), 'dd MMM yyyy')}</span>
            </div>
          )}
          {task.assignee && (
            <div className="flex items-center">
              <UserIcon className="h-3 w-3 mr-1" />
              <span>{task.assignee.first_name} {task.assignee.last_name}</span>
            </div>
          )}
        </div>
        {onEdit && (
          <div className="mt-2 text-right">
            <button 
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={handleEditClick}
            >
              Düzenle
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;
