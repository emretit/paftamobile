
import { useState } from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import TaskBasicInfo from "@/components/tasks/form/TaskBasicInfo";
import TaskAssignment from "@/components/tasks/form/TaskAssignment";
import TaskMetadata from "@/components/tasks/form/TaskMetadata";
import TaskRelatedItem from "@/components/tasks/form/TaskRelatedItem";
import FormActions from "@/components/tasks/form/FormActions";
import { FormValues } from "@/components/tasks/form/types";
import TaskSubtaskList from "@/components/tasks/form/TaskSubtaskList";
import { SubTask } from "@/types/task";

interface NewTaskPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const NewTask = ({ isCollapsed, setIsCollapsed }: NewTaskPageProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      type: "general",
      assignee_id: undefined,
      due_date: undefined,
      related_item_id: undefined,
      related_item_type: undefined,
      related_item_title: undefined,
    }
  });

  const taskType = watch("type");

  const createTaskMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Format the data for the API
      const taskData = {
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        type: data.type,
        assignee_id: data.assignee_id || null,
        due_date: data.due_date ? data.due_date.toISOString() : null,
        related_item_id: data.related_item_id || null,
        related_item_type: data.related_item_type || null,
        related_item_title: data.related_item_title || null,
        subtasks: subtasks.length > 0 ? subtasks : null,
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
      reset();
      navigate("/tasks");
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast.error("Görev oluşturulurken bir hata oluştu");
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await createTaskMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/tasks");
  };

  const handleSubtasksChange = (newSubtasks: SubTask[]) => {
    setSubtasks(newSubtasks);
  };

  return (
    <DefaultLayout 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed}
      title="Yeni Görev" 
      subtitle="CRM sisteminizdeki görevleri yönetin ve yeni görevler oluşturun"
    >
      <Card className="bg-white border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-primary">
            Yeni Görev Oluştur
          </CardTitle>
          <CardDescription>
            Görev detaylarını girin ve sisteme kaydedin. Zorunlu alanlar (<span className="text-red-500">*</span>) işareti ile belirtilmiştir.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              <TaskBasicInfo register={register} errors={errors} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Durum <span className="text-red-500">*</span></label>
                  <select 
                    {...register("status")}
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="todo">Yapılacak</option>
                    <option value="in_progress">Devam Ediyor</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="postponed">Ertelendi</option>
                  </select>
                </div>
                
                <TaskMetadata 
                  watch={watch} 
                  setValue={setValue} 
                />
              </div>
              
              <TaskAssignment 
                watch={watch} 
                setValue={setValue} 
              />

              <TaskRelatedItem 
                taskType={taskType} 
                watch={watch}
                setValue={setValue}
              />
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-md font-medium mb-4">Alt Görevler</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ana görevinize bağlı alt görevler ekleyebilirsiniz. Bu alt görevler, ana görevin tamamlanması için gerekli adımları temsil eder.
                </p>
                <TaskSubtaskList
                  subtasks={subtasks}
                  onChange={handleSubtasksChange}
                />
              </div>
            </div>
            
            <FormActions 
              onClose={handleCancel} 
              isEditing={false} 
              isSubmitting={isSubmitting} 
            />
          </form>
        </CardContent>
      </Card>
    </DefaultLayout>
  );
};

export default NewTask;
