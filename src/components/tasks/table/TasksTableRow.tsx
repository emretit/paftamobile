
import React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getPriorityColor } from "@/components/service/utils/priorityUtils";
import { getStatusColor, getStatusDisplay } from "../utils/taskDisplayUtils";
import type { Task } from "@/types/task";

interface TasksTableRowProps {
  task: Task;
  onSelectTask: (task: Task) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onDeleteTask: (taskId: string) => void;
}

const TasksTableRow = ({ 
  task, 
  onSelectTask, 
  onStatusChange, 
  onDeleteTask 
}: TasksTableRowProps) => {
  // Format date with Turkish locale
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: tr });
    } catch (error) {
      console.error("Invalid date:", dateString);
      return "-";
    }
  };

  const getRelatedItemDisplay = () => {
    if (!task.related_item_id) return "-";
    
    return (
      <span className="inline-flex items-center">
        <Badge variant="outline">
          {task.related_item_type === "opportunity" ? "Fırsat" : 
           task.related_item_type === "proposal" ? "Teklif" : 
           task.related_item_type}
        </Badge>
        <span className="ml-2 text-sm truncate max-w-[150px]">
          {task.related_item_title || task.related_item_id}
        </span>
      </span>
    );
  };

  return (
    <TableRow 
      key={task.id}
      className="cursor-pointer hover:bg-gray-50"
      onClick={() => onSelectTask(task)}
    >
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span>{task.title}</span>
          {task.description && (
            <span className="text-xs text-muted-foreground line-clamp-1 mt-1">
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
            {formatDate(task.due_date)}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <Badge className={getPriorityColor(task.priority)}>
          {task.priority === "low" ? "Düşük" : 
           task.priority === "medium" ? "Orta" : "Yüksek"}
        </Badge>
      </TableCell>
      <TableCell>
        {task.assignee ? (
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatar_url} />
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
          <span className="text-muted-foreground">Atanmamış</span>
        )}
      </TableCell>
      <TableCell>
        {getRelatedItemDisplay()}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Select
          value={task.status}
          onValueChange={(value) => onStatusChange(task.id, value as Task['status'])}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">Yapılacak</SelectItem>
            <SelectItem value="in_progress">Devam Ediyor</SelectItem>
            <SelectItem value="completed">Tamamlandı</SelectItem>
            <SelectItem value="postponed">Ertelendi</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
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
                  if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
                    onDeleteTask(task.id);
                  }
                }}
                className="text-red-600"
              >
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TasksTableRow;
