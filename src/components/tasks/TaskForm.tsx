
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task, TaskType, TaskStatus, TaskPriority } from "@/types/task";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useEmployeeNames } from "@/hooks/useEmployeeNames";

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

type FormValues = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assigned_to?: string;
  due_date?: Date;
  related_item_id?: string;
  related_item_type?: string;
  related_item_title?: string;
};

export default function TaskForm({ task, onClose }: TaskFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { employees, isLoading: isLoadingEmployees } = useEmployeeNames();
  
  // Fetch opportunities for the related entity dropdown
  const { data: opportunities } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("id, title");
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch proposals for the related entity dropdown
  const { data: proposals } = useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("id, title");
      
      if (error) throw error;
      return data || [];
    }
  });
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormValues>({
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "todo",
      priority: task?.priority || "medium",
      type: task?.type || "general",
      assigned_to: task?.assigned_to || undefined,
      due_date: task?.due_date ? new Date(task.due_date) : undefined,
      related_item_id: task?.related_item_id || undefined,
      related_item_type: task?.related_item_type || undefined,
      related_item_title: task?.related_item_title || undefined,
    }
  });

  const relatedItemType = watch("related_item_type");

  // Effect to reset related_item_id when related_item_type changes
  useEffect(() => {
    if (relatedItemType) {
      setValue("related_item_id", undefined);
      setValue("related_item_title", undefined);
    }
  }, [relatedItemType, setValue]);

  // Effect to set related_item_title when related_item_id changes
  useEffect(() => {
    const relatedItemId = watch("related_item_id");
    const relatedType = watch("related_item_type");
    
    if (relatedItemId && relatedType) {
      if (relatedType === "opportunity" && opportunities) {
        const opportunity = opportunities.find(opp => opp.id === relatedItemId);
        if (opportunity) {
          setValue("related_item_title", opportunity.title);
        }
      } else if (relatedType === "proposal" && proposals) {
        const proposal = proposals.find(prop => prop.id === relatedItemId);
        if (proposal) {
          setValue("related_item_title", proposal.title);
        }
      }
    }
  }, [watch("related_item_id"), watch("related_item_type"), opportunities, proposals, setValue]);

  const createTaskMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Format the data for the API
      const taskData = {
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        type: data.type,
        assigned_to: data.assigned_to || null,
        due_date: data.due_date ? data.due_date.toISOString() : null,
        related_item_id: data.related_item_id || null,
        related_item_type: data.related_item_type || null,
        related_item_title: data.related_item_title || null,
      };

      const { data: newTask, error } = await supabase
        .from("tasks")
        .insert(taskData)
        .select()
        .single();

      if (error) throw error;
      return newTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Görev başarıyla oluşturuldu");
      reset(); // Reset form fields
      onClose();
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast.error("Görev oluşturulurken bir hata oluştu");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!task) throw new Error("Task is required for update");

      // Format the data for the API
      const taskData = {
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        type: data.type,
        assigned_to: data.assigned_to || null,
        due_date: data.due_date ? data.due_date.toISOString() : null,
        related_item_id: data.related_item_id || null,
        related_item_type: data.related_item_type || null,
        related_item_title: data.related_item_title || null,
      };

      const { data: updatedTask, error } = await supabase
        .from("tasks")
        .update(taskData)
        .eq("id", task.id)
        .select()
        .single();

      if (error) throw error;
      return updatedTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Görev başarıyla güncellendi");
      onClose();
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast.error("Görev güncellenirken bir hata oluştu");
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      if (task) {
        await updateTaskMutation.mutateAsync(data);
      } else {
        await createTaskMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {task ? "Görevi Düzenle" : "Yeni Görev"}
        </h2>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Başlık <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            placeholder="Görev başlığı"
            {...register("title", { required: "Başlık zorunludur" })}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Açıklama <span className="text-red-500">*</span></Label>
          <Textarea
            id="description"
            placeholder="Görev açıklaması"
            rows={3}
            {...register("description", { required: "Açıklama zorunludur" })}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Durum <span className="text-red-500">*</span></Label>
            <Select 
              value={watch("status")} 
              onValueChange={(value) => setValue("status", value as TaskStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Yapılacak</SelectItem>
                <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="postponed">Ertelendi</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="priority">Öncelik</Label>
            <Select 
              value={watch("priority")} 
              onValueChange={(value) => setValue("priority", value as TaskPriority)}
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
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Tür</Label>
            <Select 
              value={watch("type")} 
              onValueChange={(value) => setValue("type", value as TaskType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tür seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Genel</SelectItem>
                <SelectItem value="call">Arama</SelectItem>
                <SelectItem value="meeting">Toplantı</SelectItem>
                <SelectItem value="follow_up">Takip</SelectItem>
                <SelectItem value="proposal">Teklif</SelectItem>
                <SelectItem value="opportunity">Fırsat</SelectItem>
                <SelectItem value="reminder">Hatırlatma</SelectItem>
                <SelectItem value="email">E-posta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="due_date">Son Tarih</Label>
            <DatePicker 
              selected={watch("due_date")} 
              onSelect={(date) => setValue("due_date", date)} 
              placeholder="Son tarih seçin" 
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="assigned_to">Atanan Çalışan <span className="text-red-500">*</span></Label>
          <Select 
            value={watch("assigned_to") || ""} 
            onValueChange={(value) => setValue("assigned_to", value || undefined)}
            disabled={isLoadingEmployees}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoadingEmployees ? "Yükleniyor..." : "Çalışan seçin"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Atanmamış</SelectItem>
              {employees?.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.assigned_to && (
            <p className="text-sm text-red-500">{errors.assigned_to.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="related_item_type">İlgili Kayıt Türü</Label>
          <Select
            value={watch("related_item_type") || ""}
            onValueChange={(value) => 
              setValue("related_item_type", value === "" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="İlgili kayıt türü seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Seçilmedi</SelectItem>
              <SelectItem value="opportunity">Fırsat</SelectItem>
              <SelectItem value="proposal">Teklif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {relatedItemType && (
          <div className="grid gap-2">
            <Label htmlFor="related_item_id">İlgili {relatedItemType === "opportunity" ? "Fırsat" : "Teklif"}</Label>
            <Select
              value={watch("related_item_id") || ""}
              onValueChange={(value) => 
                setValue("related_item_id", value === "" ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={`İlgili ${relatedItemType === "opportunity" ? "fırsat" : "teklif"} seçin`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Seçilmedi</SelectItem>
                {relatedItemType === "opportunity" && opportunities?.map((opportunity) => (
                  <SelectItem key={opportunity.id} value={opportunity.id}>
                    {opportunity.title}
                  </SelectItem>
                ))}
                {relatedItemType === "proposal" && proposals?.map((proposal) => (
                  <SelectItem key={proposal.id} value={proposal.id}>
                    {proposal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose} 
          disabled={isSubmitting}
        >
          İptal
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Kaydediliyor..." : task ? "Güncelle" : "Oluştur"}
        </Button>
      </div>
    </form>
  );
}
