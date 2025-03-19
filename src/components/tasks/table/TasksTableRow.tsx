
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Task } from "@/types/task";
import { getPriorityColor } from "@/components/service/utils/priorityUtils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { getStatusColor, getStatusDisplay, getTypeDisplay } from "../utils/taskDisplayUtils";

interface TasksTableRowProps {
  task: Task;
  onSelectTask: (task: Task) => void;
}

const TasksTableRow = ({ task, onSelectTask }: TasksTableRowProps) => {
  // Function to format date with proper locale
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: tr });
    } catch (error) {
      console.error("Invalid date:", dateString);
      return "-";
    }
  };

  return (
    <TableRow 
      key={task.id} 
      onClick={() => onSelectTask(task)} 
      className="cursor-pointer hover:bg-gray-50"
    >
      <TableCell className="font-medium">{task.title}</TableCell>
      <TableCell>
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {task.assignee.avatar_url && (
                <AvatarImage src={task.assignee.avatar_url} alt={`${task.assignee.first_name} ${task.assignee.last_name}`} />
              )}
              <AvatarFallback>
                {task.assignee.first_name?.[0]}
                {task.assignee.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">
              {task.assignee.first_name} {task.assignee.last_name}
            </span>
          </div>
        ) : (
          <span className="text-gray-500 text-sm">Atanmamış</span>
        )}
      </TableCell>
      <TableCell>
        <Badge className={getPriorityColor(task.priority)}>
          {task.priority === "low" ? "Düşük" : 
           task.priority === "medium" ? "Orta" : "Yüksek"}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(task.status)}>
          {getStatusDisplay(task.status)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {task.type ? getTypeDisplay(task.type) : "Genel"}
        </Badge>
      </TableCell>
      <TableCell>
        {formatDate(task.due_date)}
      </TableCell>
      <TableCell>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            onSelectTask(task);
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default TasksTableRow;
