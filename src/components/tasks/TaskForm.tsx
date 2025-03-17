
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Task, TaskType, TaskPriority, TaskStatus, SubTask } from "@/types/task";
import { useTaskMutations } from "./hooks/useTaskMutations";
import TaskAssigneeSelect from "./form/TaskAssigneeSelect";
import TaskDatePicker from "./form/TaskDatePicker";
import TaskRelatedItem from "./form/TaskRelatedItem";
import TaskSubtaskList from "./form/TaskSubtaskList";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.string(),
  priority: z.string(),
  type: z.string(),
  assignee_id: z.string().optional(),
  due_date: z.string().optional(),
  related_item_id: z.string().optional(),
  related_item_title: z.string().optional(),
});

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

export const TaskForm = ({ task, onClose }: TaskFormProps) => {
  const { createTask, updateTask } = useTaskMutations();
  
  // Parse subtasks from string if needed
  const parseSubtasks = (task?: Task): SubTask[] => {
    if (!task || !task.subtasks) return [];
    
    if (typeof task.subtasks === 'string') {
      try {
        return JSON.parse(task.subtasks);
      } catch (e) {
        console.error("Error parsing subtasks string:", e);
        return [];
      }
    }
    
    return task.subtasks;
  };
  
  const [subtasks, setSubtasks] = useState<SubTask[]>(parseSubtasks(task));
  
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "todo",
      priority: task?.priority || "medium",
      type: task?.type || "general",
      assignee_id: task?.assignee_id || undefined,
      due_date: task?.due_date || undefined,
      related_item_id: task?.related_item_id || undefined,
      related_item_title: task?.related_item_title || undefined,
    },
  });

  const handleSubmit = async (values: z.infer<typeof taskSchema>) => {
    try {
      if (task) {
        await updateTask({
          id: task.id,
          ...values,
          subtasks
        });
        toast.success("Görev güncellendi");
      } else {
        await createTask({
          ...values,
          subtasks
        });
        toast.success("Görev oluşturuldu");
      }
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Görev kaydedilirken bir hata oluştu");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Task Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Başlık</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Task Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Task Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Durum</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="todo">Yapılacak</SelectItem>
                  <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="postponed">Ertelendi</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Task Priority */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Öncelik</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Öncelik seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Task Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tür</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="general">Genel</SelectItem>
                  <SelectItem value="opportunity">Fırsat</SelectItem>
                  <SelectItem value="proposal">Teklif</SelectItem>
                  <SelectItem value="email">E-posta</SelectItem>
                  <SelectItem value="call">Arama</SelectItem>
                  <SelectItem value="meeting">Toplantı</SelectItem>
                  <SelectItem value="follow_up">Takip</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Task Assignee */}
        <TaskAssigneeSelect
          form={form}
          defaultValue={task?.assignee_id}
        />

        {/* Task Due Date */}
        <TaskDatePicker
          form={form}
          defaultValue={task?.due_date}
        />

        {/* Related Item */}
        <TaskRelatedItem
          form={form}
          taskType={form.watch("type") as TaskType}
          defaultRelatedItemId={task?.related_item_id}
          defaultRelatedItemTitle={task?.related_item_title}
        />

        <Separator />

        {/* Subtasks */}
        <TaskSubtaskList
          subtasks={subtasks}
          onChange={setSubtasks}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} type="button">
            İptal
          </Button>
          <Button type="submit">
            {task ? "Güncelle" : "Oluştur"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaskForm;
