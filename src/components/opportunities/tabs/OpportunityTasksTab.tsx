
import { useState } from "react";
import { Calendar, Loader2, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TaskDetailSheet from "@/components/tasks/TaskDetailSheet";
import { Task } from "@/types/task";
import { format } from "date-fns";

interface OpportunityTasksTabProps {
  opportunity: any;
}

export const OpportunityTasksTab = ({ opportunity }: OpportunityTasksTabProps) => {
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const tasks = opportunity?.tasks || [];
  const isLoading = false;

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleCloseTaskDetail = () => {
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
  };

  const getTaskPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-blue-100 text-blue-800 border-blue-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-red-100 text-red-800 border-red-200"
    };
    const labels = {
      low: "Düşük",
      medium: "Orta",
      high: "Yüksek"
    };
    
    return (
      <Badge className={`${colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}>
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    );
  };

  const getTaskStatusBadge = (status: string) => {
    const colors = {
      todo: "bg-gray-100 text-gray-800 border-gray-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      postponed: "bg-yellow-100 text-yellow-800 border-yellow-200"
    };
    const labels = {
      todo: "Yapılacak",
      in_progress: "Devam Ediyor",
      completed: "Tamamlandı",
      postponed: "Ertelendi"
    };
    
    return (
      <Badge className={`${colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatTaskDate = (date: string) => {
    if (!date) return "";
    try {
      return format(new Date(date), "dd.MM.yyyy");
    } catch (error) {
      return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Görevler</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Yeni Görev Ekle
        </Button>
      </div>

      {/* Tasks list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-5 w-5 mx-auto animate-spin text-gray-500" />
            <p className="text-sm text-gray-500 mt-2">Görevler yükleniyor...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Bu fırsat için henüz bir görev oluşturulmamış.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
                onClick={() => handleTaskClick(task)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <div className="flex items-center gap-2">
                    {getTaskPriorityBadge(task.priority)}
                    {getTaskStatusBadge(task.status)}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div>
                    {task.due_date ? (
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        {formatTaskDate(task.due_date)}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center">
                    <User className="h-3.5 w-3.5 mr-1.5" />
                    {task.assignee ? (task.assignee.first_name ? `${task.assignee.first_name} ${task.assignee.last_name || ''}` : 'Atanmamış') : 'Atanmamış'}
                  </div>
                </div>
                {task.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        isOpen={isTaskDetailOpen}
        onClose={handleCloseTaskDetail}
        task={selectedTask}
      />
    </div>
  );
};
