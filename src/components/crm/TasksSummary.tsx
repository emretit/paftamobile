import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isPast, isToday } from "date-fns";
import { tr } from "date-fns/locale";
import { Task, TaskStatus, TaskType } from "@/types/task";

interface TaskWithOverdue extends Task {
  isOverdue: boolean;
}

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-blue-100 text-blue-800 border-blue-200"
};

const TasksSummary = () => {
  const [tasks, setTasks] = useState<TaskWithOverdue[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .in('status', ['todo', 'in_progress'])
          .order('due_date', { ascending: true })
          .limit(5);
          
        if (error) throw error;
        
        const formattedData: TaskWithOverdue[] = data.map(task => {
          const dueDate = task.due_date ? new Date(task.due_date) : null;
          const isOverdue = dueDate ? isPast(dueDate) && !isToday(dueDate) : false;
          
          return {
            ...task,
            status: (task.status || 'todo') as TaskStatus,
            priority: (task.priority || 'medium') as TaskPriority,
            type: (task.type || 'general') as TaskType,
            created_at: task.created_at || new Date().toISOString(),
            updated_at: task.updated_at || new Date().toISOString(),
            isOverdue
          } as TaskWithOverdue;
        });
        
        setTasks(formattedData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Görevler yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
  const handleCompleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', id);
        
      if (error) throw error;
      
      setTasks(prevTasks => 
        prevTasks.filter(task => task.id !== id)
      );
      
      toast.success('Görev tamamlandı');
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Görev tamamlanamadı');
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Bekleyen görev bulunmuyor</p>
        <p className="text-sm mt-2">Görevler sayfasından yeni görev ekleyebilirsiniz</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          className={`p-3 rounded-lg border flex justify-between items-center ${
            task.isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              {task.isOverdue && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span className={`font-medium truncate ${task.isOverdue ? 'text-red-700' : ''}`}>
                {task.title}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge 
                variant="secondary"
                className={priorityColors[task.priority as keyof typeof priorityColors]}
              >
                {task.priority === 'high' ? 'Yüksek' : 
                 task.priority === 'medium' ? 'Orta' : 'Düşük'}
              </Badge>
              
              {task.due_date && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {format(new Date(task.due_date), 'd MMM', { locale: tr })}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0" 
            onClick={() => handleCompleteTask(task.id)}
          >
            <CheckCircle className="h-5 w-5" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default TasksSummary;
