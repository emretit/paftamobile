
import { Draggable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskWithOverdue, TaskPriority } from "@/types/task";
import { format } from "date-fns";
import { getPriorityColor } from "@/components/service/utils/priorityUtils";

interface TaskCardProps {
  task: TaskWithOverdue;
  index: number;
  onEdit?: () => void;
  onSelect?: () => void;
}

const TaskCard = ({ task, index, onEdit, onSelect }: TaskCardProps) => {
  const priorityColor = getPriorityColor(task.priority as TaskPriority);
  
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${snapshot.isDragging ? "opacity-70" : ""}`}
          onClick={onSelect}
        >
          <Card className={`
            ${task.isOverdue ? "border-red-300" : ""} 
            hover:border-red-200 cursor-pointer
          `}>
            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">{task.title}</h4>
                {onEdit && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    <PencilIcon className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {task.description && (
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                  {task.description}
                </p>
              )}
              
              <div className="flex justify-between items-center">
                <Badge className={priorityColor} variant="secondary">
                  {task.priority === "high" 
                    ? "Yüksek" 
                    : task.priority === "medium" 
                      ? "Orta" 
                      : "Düşük"}
                </Badge>
                
                {task.due_date && (
                  <div className={`
                    flex items-center text-xs 
                    ${task.isOverdue ? "text-red-500 font-medium" : "text-gray-500"}
                  `}>
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {format(new Date(task.due_date), "dd MMM")}
                  </div>
                )}
              </div>
              
              {task.assignee && (
                <div className="flex justify-end mt-2">
                  <Avatar className="h-5 w-5">
                    {task.assignee.avatar_url && (
                      <AvatarImage
                        src={task.assignee.avatar_url}
                        alt={`${task.assignee.first_name} ${task.assignee.last_name}`}
                      />
                    )}
                    <AvatarFallback className="text-[10px]">
                      {task.assignee.first_name?.[0]}
                      {task.assignee.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
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
