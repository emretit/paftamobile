
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Task } from "@/types/task";
import { getPriorityColor } from "@/components/service/utils/priorityUtils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

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
      
    const matchesEmployee = !selectedEmployee || selectedEmployee === "all" || task.assigned_to === selectedEmployee;
    const matchesType = !selectedType || selectedType === "all" || task.type === selectedType;
    
    return matchesSearch && matchesEmployee && matchesType;
  });

  // Function to get the status display name
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "todo": return "Yapılacak";
      case "in_progress": return "Devam Ediyor";
      case "completed": return "Tamamlandı";
      case "postponed": return "Ertelendi";
      default: return status;
    }
  };

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-gray-100 text-gray-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "postponed": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Başlık</TableHead>
            <TableHead>Atanan</TableHead>
            <TableHead>Öncelik</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Tip</TableHead>
            <TableHead>Son Tarih</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-48" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
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
          <TableHead>Başlık</TableHead>
          <TableHead>Atanan</TableHead>
          <TableHead>Öncelik</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>Tip</TableHead>
          <TableHead>Son Tarih</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredTasks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
              Filtrelerle eşleşen görev bulunamadı
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
                  {task.type === "general" ? "Genel" :
                   task.type === "call" ? "Arama" :
                   task.type === "meeting" ? "Toplantı" :
                   task.type === "follow_up" ? "Takip" :
                   task.type === "proposal" ? "Teklif" :
                   task.type === "opportunity" ? "Fırsat" :
                   task.type === "reminder" ? "Hatırlatma" :
                   task.type === "email" ? "E-posta" : task.type}
                </Badge>
              </TableCell>
              <TableCell>
                {formatDate(task.due_date)}
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
