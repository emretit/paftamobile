
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Task } from "@/types/task";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

interface FormData {
  title: string;
  description: string;
  priority: Task['priority'];
  type: Task['type'];
  assignee_id?: string;
  due_date?: string;
  related_item_id?: string;
  related_item_title?: string;
}

const TaskForm = ({ isOpen, onClose, taskToEdit }: TaskFormProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, reset, watch } = useForm<FormData>({
    defaultValues: taskToEdit || {
      title: "",
      description: "",
      priority: "medium",
      type: "general",
    }
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
    mutationFn: async (data: FormData) => {
      const { data: task, error } = await supabase
        .from('tasks')
        .insert([{
          ...data,
          status: 'todo'
        }])
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev başarıyla oluşturuldu');
      onClose();
      reset();
    },
    onError: (error) => {
      toast.error('Görev oluşturulurken bir hata oluştu');
      console.error('Error creating task:', error);
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!taskToEdit?.id) throw new Error('Task ID is required for updates');

      const { data: task, error } = await supabase
        .from('tasks')
        .update(data)
        .eq('id', taskToEdit.id)
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev başarıyla güncellendi');
      onClose();
      reset();
    },
    onError: (error) => {
      toast.error('Görev güncellenirken bir hata oluştu');
      console.error('Error updating task:', error);
    }
  });

  const onSubmit = (data: FormData) => {
    if (taskToEdit) {
      updateTaskMutation.mutate(data);
    } else {
      createTaskMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {taskToEdit ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              {...register("title", { required: true })}
              placeholder="Görev başlığını girin"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Görev açıklamasını girin"
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Öncelik</Label>
              <Select
                value={watch("priority")}
                onValueChange={(value) => setValue("priority", value as Task["priority"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Öncelik seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tip</Label>
              <Select
                value={watch("type")}
                onValueChange={(value) => setValue("type", value as Task["type"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Görev tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Genel</SelectItem>
                  <SelectItem value="opportunity">Fırsat</SelectItem>
                  <SelectItem value="proposal">Teklif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Atanan Kişi</Label>
              <Select
                value={watch("assignee_id") || ""}
                onValueChange={(value) => setValue("assignee_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kişi seçin" />
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
              <Label>Bitiş Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watch("due_date") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch("due_date") ? format(new Date(watch("due_date")), "PPP") : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watch("due_date") ? new Date(watch("due_date")) : undefined}
                    onSelect={(date) => setValue("due_date", date?.toISOString())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {watch("type") !== "general" && (
            <div className="space-y-2">
              <Label>İlişkili Öğe</Label>
              <Select
                value={watch("related_item_id") || ""}
                onValueChange={(value) => {
                  const [type, id] = value.split(':');
                  let title = "";
                  if (type === "opportunity") {
                    title = relatedItems?.opportunities.find(o => o.id === id)?.title || "";
                  } else if (type === "proposal") {
                    title = relatedItems?.proposals.find(p => p.id === id)?.title || "";
                  }
                  setValue("related_item_id", id);
                  setValue("related_item_title", title);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="İlişkili öğe seçin" />
                </SelectTrigger>
                <SelectContent>
                  {watch("type") === "opportunity" && relatedItems?.opportunities.map((opp) => (
                    <SelectItem key={opp.id} value={`opportunity:${opp.id}`}>
                      {opp.title}
                    </SelectItem>
                  ))}
                  {watch("type") === "proposal" && relatedItems?.proposals.map((prop) => (
                    <SelectItem key={prop.id} value={`proposal:${prop.id}`}>
                      {prop.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit">
              {taskToEdit ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
