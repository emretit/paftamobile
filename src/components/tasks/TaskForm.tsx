
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Task, TaskType, TaskPriority } from "@/types/task";

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

const taskFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "completed", "postponed"]),
  priority: z.enum(["low", "medium", "high"]),
  type: z.enum(["general", "call", "meeting", "follow_up", "proposal", "opportunity", "reminder", "email"]),
  due_date: z.date().optional().nullable(),
  assignee_id: z.string().optional().nullable(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const TaskForm = ({ task, onClose }: TaskFormProps) => {
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.due_date ? new Date(task.due_date) : undefined
  );
  const [employees, setEmployees] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "todo",
      priority: task?.priority || "medium",
      type: task?.type || "general",
      due_date: task?.due_date ? new Date(task.due_date) : null,
      assignee_id: task?.assignee_id || task?.assigned_to || null,
    },
  });

  // Watch form values
  const watchedStatus = watch("status");
  const watchedPriority = watch("priority");
  const watchedType = watch("type");
  const watchedAssignee = watch("assignee_id");

  // Fetch employees for assignee selection
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("id, first_name, last_name, avatar_url")
          .order("first_name", { ascending: true });

        if (error) throw error;
        setEmployees(data || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Failed to load employees");
      }
    };

    fetchEmployees();
  }, []);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (formData: TaskFormValues) => {
      const taskData = {
        ...formData,
        due_date: formData.due_date ? formData.due_date.toISOString() : null,
        assignee_id: formData.assignee_id || null,
        assigned_to: formData.assignee_id || null, // For compatibility
      };

      const { data, error } = await supabase
        .from("tasks")
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
      onClose();
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (formData: TaskFormValues) => {
      if (!task) throw new Error("Task ID is missing for update");

      const taskData = {
        ...formData,
        due_date: formData.due_date ? formData.due_date.toISOString() : null,
        assignee_id: formData.assignee_id || null,
        assigned_to: formData.assignee_id || null, // For compatibility
      };

      const { data, error } = await supabase
        .from("tasks")
        .update(taskData)
        .eq("id", task.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated successfully");
      onClose();
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    },
  });

  const onSubmit = (data: TaskFormValues) => {
    if (task) {
      updateTaskMutation.mutate(data);
    } else {
      createTaskMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...register("title")}
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={watchedStatus}
              onValueChange={(value) => setValue("status", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="postponed">Postponed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={watchedPriority}
              onValueChange={(value) => setValue("priority", value as TaskPriority)}
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
            <Label htmlFor="type">Type</Label>
            <Select
              value={watchedType}
              onValueChange={(value) => setValue("type", value as TaskType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="opportunity">Opportunity</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setValue("due_date", date);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Select
              value={watchedAssignee || ""}
              onValueChange={(value) => {
                setValue("assignee_id", value === "unassigned" ? null : value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
        >
          {createTaskMutation.isPending || updateTaskMutation.isPending
            ? "Saving..."
            : task
            ? "Update Task"
            : "Create Task"}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
