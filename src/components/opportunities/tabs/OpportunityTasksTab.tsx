
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import TaskForm from "@/components/tasks/TaskForm";
import { Task } from "@/types/task";
import TaskCard from "@/components/tasks/TaskCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface OpportunityTasksTabProps {
  opportunityId: string;
}

const OpportunityTasksTab = ({ opportunityId }: OpportunityTasksTabProps) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['opportunity-tasks', opportunityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(id, first_name, last_name, avatar_url)
        `)
        .eq('related_item_id', opportunityId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Parse subtasks if stored as string
      return data.map((task: any) => {
        let parsedSubtasks = [];
        
        if (task.subtasks && typeof task.subtasks === 'string') {
          try {
            parsedSubtasks = JSON.parse(task.subtasks);
          } catch (e) {
            console.error('Error parsing subtasks JSON:', e);
          }
        }
        
        return {
          ...task,
          subtasks: parsedSubtasks
        };
      }) as Task[];
    }
  });
  
  const handleOpenTaskForm = (task?: Task) => {
    setSelectedTask(task || null);
    setIsTaskModalOpen(true);
  };
  
  const handleCloseTaskForm = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(false);
  };
  
  if (isLoading) {
    return <div className="flex justify-center p-4">Yükleniyor...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 p-4">Görevler yüklenirken bir hata oluştu.</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Görevler</h3>
        <Button 
          variant="outline" 
          onClick={() => handleOpenTaskForm()}
          className="border-red-200 text-red-700 hover:bg-red-50"
        >
          <Plus className="h-4 w-4 mr-1" />
          Yeni Görev
        </Button>
      </div>
      
      <div className="space-y-3">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={() => handleOpenTaskForm(task)}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">Bu fırsata ait görev bulunmuyor</p>
        )}
      </div>
      
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedTask ? "Görevi Düzenle" : "Yeni Görev"}</DialogTitle>
          </DialogHeader>
          <TaskForm 
            task={selectedTask || undefined} 
            onClose={handleCloseTaskForm} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OpportunityTasksTab;
