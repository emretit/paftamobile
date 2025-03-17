
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
  
  const defaultValues: FormData = taskToEdit ? {
    title: taskToEdit.title,
    description: taskToEdit.description,
    priority: taskToEdit.priority,
    type: taskToEdit.type,
    assignee_id: taskToEdit.assignee_id,
    due_date: taskToEdit.due_date,
    related_item_id: taskToEdit.related_item_id,
    related_item_title: taskToEdit.related_item_title
  } : {
    title: "",
    description: "",
    priority: "medium",
    type: "general",
    assignee_id: undefined,
    due_date: undefined,
    related_item_id: undefined,
    related_item_title: undefined
  };
  
  const { register, handleSubmit, setValue, reset, watch } = useForm<FormData>({
    defaultValues
  });

  const { createTask, updateTask } = useTaskMutations();

  const handleSuccess = () => {
    onClose();
    reset();
  };

  const onSubmit = (formData: FormData) => {
    if (taskToEdit) {
      updateTask.mutate({
        id: taskToEdit.id,
        updates: {
          ...formData,
          subtasks: JSON.stringify(subtasks)
        }
      }, {
        onSuccess: handleSuccess
      });
    } else {
      createTask.mutate({
        ...formData,
        subtasks: JSON.stringify(subtasks)
      }, {
        onSuccess: handleSuccess
      });
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
