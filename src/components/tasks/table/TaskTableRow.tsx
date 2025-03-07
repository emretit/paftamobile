
import { format } from "date-fns";
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
import { PriorityBadge } from "./PriorityBadge";
import type { Task } from "@/types/task";

interface TaskTableRowProps {
  task: Task;
  onSelectTask: (task: Task) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskTableRow = ({ 
  task, 
  onSelectTask, 
  onStatusChange, 
  onDeleteTask 
}: TaskTableRowProps) => {
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
            <span className="text-xs text-gray-500 line-clamp-1 mt-1">
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
            {format(new Date(task.due_date), "dd MMM yyyy")}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </TableCell>
      <TableCell><PriorityBadge priority={task.priority} /></TableCell>
      <TableCell>
        {task.assignee ? (
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatar} />
              <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{task.assignee.name}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
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
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="postponed">Postponed</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div onClick={(e) => e.stopPropagation()}>
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
                  if (confirm('Are you sure you want to delete this task?')) {
                    onDeleteTask(task.id);
                  }
                }}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TaskTableRow;
