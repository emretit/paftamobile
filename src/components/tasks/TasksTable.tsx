
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Task } from "@/types/task";
import { getPriorityColor } from "@/components/service/utils/priorityUtils";

export interface TasksTableProps {
  tasks: Task[];
  isLoading: boolean;
  onSelectTask: (task: Task) => void;
  searchQuery?: string;
  selectedEmployee?: string;
  selectedType?: string;
}

export const TasksTable = ({
  tasks,
  isLoading,
  onSelectTask,
  searchQuery = "",
  selectedEmployee = "",
  selectedType = ""
}: TasksTableProps) => {
  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesEmployee = !selectedEmployee || task.assignee_id === selectedEmployee;
    const matchesType = !selectedType || task.type === selectedType;
    
    return matchesSearch && matchesEmployee && matchesType;
  });

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-48" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-4" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Assignee</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredTasks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
              No tasks found with the current filters
            </TableCell>
          </TableRow>
        ) : (
          filteredTasks.map((task) => (
            <TableRow key={task.id} onClick={() => onSelectTask(task)} className="cursor-pointer hover:bg-gray-50">
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
                  <span className="text-gray-500 text-sm">Unassigned</span>
                )}
              </TableCell>
              <TableCell>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No date"}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default TasksTable;
