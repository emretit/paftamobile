
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Task } from '@/types/task';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { getPriorityColor } from '@/components/deals/utils/colorUtils';
import { useTechnicianNames } from '@/components/service/hooks/useTechnicianNames';

interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
  onSelect?: () => void;
}

const TaskCard = ({ task, onEdit, onSelect }: TaskCardProps) => {
  const { getTechnicianName } = useTechnicianNames();
  
  const handleClick = () => {
    if (onSelect) {
      onSelect();
    } else if (onEdit) {
      onEdit();
    }
  };
  
  const formatDate = (date?: string) => {
    if (!date) return null;
    try {
      return format(new Date(date), 'dd MMM yyyy');
    } catch (e) {
      return null;
    }
  };
  
  // Handle subtasks
  let completedSubtasks = 0;
  let totalSubtasks = 0;
  
  if (task.subtasks && Array.isArray(task.subtasks)) {
    totalSubtasks = task.subtasks.length;
    completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
  }
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 truncate mr-2">{task.title}</h3>
          <div className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
            {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
          </div>
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex flex-col space-y-2">
          {task.assignee_id && (
            <div className="flex items-center text-xs text-gray-500">
              <span className="font-medium mr-1">Görevli:</span>
              {getTechnicianName(task.assignee_id)}
            </div>
          )}
          
          {task.due_date && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatDate(task.due_date)}</span>
            </div>
          )}
          
          {totalSubtasks > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              <span>{completedSubtasks}/{totalSubtasks} alt görev tamamlandı</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
