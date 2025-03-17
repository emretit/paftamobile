
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, UserIcon, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Task } from '@/types/task';
import { getTaskStatusColor, getPriorityColor } from '@/components/deals/utils/colorUtils';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit?: () => void;
  onSelect?: () => void;
}

const TaskCard = ({ task, index, onEdit, onSelect }: TaskCardProps) => {
  const getRelatedItemUrl = (task: Task) => {
    if (!task.related_item_id) return null;
    
    switch (task.related_item_type) {
      case 'opportunity':
        return `/opportunities?id=${task.related_item_id}`;
      case 'proposal':
        return `/proposals/${task.related_item_id}`;
      default:
        return null;
    }
  };

  const relatedItemUrl = getRelatedItemUrl(task);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 ${snapshot.isDragging ? 'opacity-75' : ''}`}
        >
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={onSelect}
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
              <div className="flex flex-col gap-2">
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
                
                {task.related_item_title && (
                  <div className="flex items-center text-xs">
                    <LinkIcon className="h-3 w-3 mr-1 text-blue-500" />
                    {relatedItemUrl ? (
                      <Link 
                        to={relatedItemUrl} 
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {task.related_item_title}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">{task.related_item_title}</span>
                    )}
                  </div>
                )}
              </div>
              
              {onEdit && (
                <div className="mt-2 text-right">
                  <button 
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    Düzenle
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
