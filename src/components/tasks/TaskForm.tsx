import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import type { Task } from "@/types/task";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

const TaskForm = ({ isOpen, onClose, taskToEdit }: TaskFormProps) => {
  const queryClient = useQueryClient();
  const [task, setTask] = useState<Partial<Task>>(taskToEdit || {
    title: "",
    description: "",
    status: "todo" as const,
    priority: "low" as const,
    type: "general" as const
  });

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('status', 'active');
      if (error) throw error;
      return data;
    }
  });

  const { data: relatedItems } = useQuery({
    queryKey: ['related-items'],
    queryFn: async () => {
      const [opportunities, proposals] = await Promise.all([
        supabase.from('deals').select('id, title'),
        supabase.from('proposals').select('id, title')
      ]);
      return {
        opportunities: opportunities.data || [],
        proposals: proposals.data || []
      };
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (newTask: Partial<Task>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select(`
          *,
          assignee:assignee_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to create task');
      console.error('Error creating task:', error);
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: Partial<Task>) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updatedTask)
        .eq('id', taskToEdit?.id)
        .select(`
          *,
          assignee:assignee_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to update task');
      console.error('Error updating task:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskToEdit) {
      updateTaskMutation.mutate(task);
    } else {
      createTaskMutation.mutate(task);
    }
  };

  const handlePriorityChange = (value: string) => {
    setTask(prev => ({ ...prev, priority: value as Task['priority'] }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={task.title}
              onChange={(e) => setTask(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={task.description}
              onChange={(e) => setTask(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !task.due_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {task.due_date ? format(new Date(task.due_date), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={task.due_date ? new Date(task.due_date) : undefined}
                  onSelect={(date) => setTask(prev => ({ ...prev, due_date: date?.toISOString() }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={task.priority}
              onValueChange={handlePriorityChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select
              value={task.assignee_id}
              onValueChange={(value) => setTask(prev => ({ ...prev, assignee_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {employees?.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Related Item</Label>
            <Select
              value={task.related_item_id}
              onValueChange={(value) => {
                const [type, id] = value.split(':');
                const items = type === 'opportunity' ? relatedItems?.opportunities : relatedItems?.proposals;
                const item = items?.find(i => i.id === id);
                setTask(prev => ({
                  ...prev,
                  related_item_id: id,
                  related_item_type: type,
                  related_item_title: item?.title
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Link to opportunity/proposal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {relatedItems?.opportunities.map((opp) => (
                  <SelectItem key={opp.id} value={`opportunity:${opp.id}`}>
                    Opportunity: {opp.title}
                  </SelectItem>
                ))}
                {relatedItems?.proposals.map((prop) => (
                  <SelectItem key={prop.id} value={`proposal:${prop.id}`}>
                    Proposal: {prop.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {taskToEdit ? 'Update' : 'Create'} Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
