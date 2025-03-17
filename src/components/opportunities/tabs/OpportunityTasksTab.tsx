
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
          assignee:assignee_id(id, first_name, last_name, avatar_url)
        `)
        .eq('related_item_id', opportunityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match the Task type
      return data.map(task => ({
        ...task,
        item_type: 'opportunity' // Set item_type for opportunity-related tasks
      })) as Task[];
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
