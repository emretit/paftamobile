
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSubtasks } from "./hooks/useSubtasks";
import { useTaskMutations } from "./hooks/useTaskMutations";
import type { Task } from "@/types/task";
import type { FormData } from "./form/types";
import TaskBasicInfo from "./form/TaskBasicInfo";
import TaskMetadata from "./form/TaskMetadata";
import TaskAssignment from "./form/TaskAssignment";
import TaskRelatedItem from "./form/TaskRelatedItem";
import SubtasksSection from "./form/SubtasksSection";
import FormActions from "./form/FormActions";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

const TaskForm = ({ isOpen, onClose, taskToEdit }: TaskFormProps) => {
  const {
    subtasks,
    newSubtask,
    setNewSubtask,
    handleAddSubtask,
    handleToggleSubtask,
    handleDeleteSubtask
  } = useSubtasks(taskToEdit?.subtasks);
  
  const { register, handleSubmit, setValue, reset, watch } = useForm<FormData>({
    defaultValues: taskToEdit || {
      title: "",
      description: "",
      priority: "medium",
      type: "general",
      subtasks: []
    }
  });

  const handleSuccess = () => {
    onClose();
    reset();
  };

  const { createTaskMutation, updateTaskMutation } = useTaskMutations(handleSuccess, taskToEdit);

  const onSubmit = (formData: FormData) => {
    if (taskToEdit) {
      updateTaskMutation.mutate({ formData, subtasks });
    } else {
      createTaskMutation.mutate({ formData, subtasks });
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
          <TaskBasicInfo register={register} />
          <TaskMetadata watch={watch} setValue={setValue} />
          <TaskAssignment watch={watch} setValue={setValue} />
          <TaskRelatedItem watch={watch} setValue={setValue} />
          
          <SubtasksSection
            subtasks={subtasks}
            newSubtask={newSubtask}
            setNewSubtask={setNewSubtask}
            handleAddSubtask={handleAddSubtask}
            handleToggleSubtask={handleToggleSubtask}
            handleDeleteSubtask={handleDeleteSubtask}
          />

          <FormActions onClose={onClose} isEditing={!!taskToEdit} />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
