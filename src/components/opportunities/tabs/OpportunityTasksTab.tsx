
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TaskCard from "../../tasks/TaskCard";
import { useState } from "react";
import NewTaskForm from "../../tasks/NewTaskForm";

interface OpportunityTasksTabProps {
  opportunityId: string;
}

const OpportunityTasksTab = ({ opportunityId }: OpportunityTasksTabProps) => {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  // Fetch tasks related to this opportunity
  const { data: tasks, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks', 'opportunity', opportunityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(id, first_name, last_name, email, phone, position, department, status, avatar_url)
        `)
        .eq('related_item_id', opportunityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match the Task type structure
      return data.map(task => {
        let taskAssignee = null;
        
        // Check if assignee exists and has expected properties
        if (task.assignee && typeof task.assignee === 'object' && !('error' in task.assignee)) {
          const assignee = task.assignee as any;
          if (assignee) {
            taskAssignee = {
              id: assignee.id,
              first_name: assignee.first_name,
              last_name: assignee.last_name,
              email: assignee.email,
              phone: assignee.phone,
              position: assignee.position,
              department: assignee.department,
              status: assignee.status,
              name: `${assignee.first_name} ${assignee.last_name}`,
              avatar: assignee.avatar_url
            };
          }
        }

        return {
          ...task,
          item_type: 'opportunity' as const, // Set item_type for opportunity-related tasks
          assignee: taskAssignee
        };
      }) as Task[];
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Görevler yüklenirken bir hata oluştu</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Görevler</h3>
          <Button 
            size="sm" 
            onClick={() => setShowNewTaskForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Görev Ekle
          </Button>
        </div>

        {showNewTaskForm && (
          <div className="mb-4">
            <NewTaskForm 
              relatedItemId={opportunityId}
              relatedItemTitle="Fırsat"
              onSuccess={() => {
                setShowNewTaskForm(false);
                refetch();
              }}
              onCancel={() => setShowNewTaskForm(false)}
            />
          </div>
        )}

        <div className="space-y-3">
          {tasks && tasks.length > 0 ? (
            tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onEdit={() => {}} 
                onSelect={() => {}}
              />
            ))
          ) : (
            <p className="text-center py-6 text-gray-500">Bu fırsatla ilgili görev bulunmamaktadır</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OpportunityTasksTab;
