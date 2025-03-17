
import { Droppable } from "@hello-pangea/dnd";
import { TaskWithOverdue } from "@/types/task";
import TaskCard from "./TaskCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: TaskWithOverdue[];
  onTaskEdit?: (task: TaskWithOverdue) => void;
  onTaskSelect?: (task: TaskWithOverdue) => void;
}

const KanbanColumn = ({ id, title, tasks, onTaskEdit, onTaskSelect }: KanbanColumnProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-3">
        <h3 className="font-medium text-gray-700">
          {title} ({tasks.length})
        </h3>
      </div>
      
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            className={`flex-1 p-2 min-h-[400px] rounded-md ${
              snapshot.isDraggingOver ? "bg-gray-100" : "bg-gray-50"
            } overflow-y-auto space-y-2`}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onTaskEdit ? () => onTaskEdit(task) : undefined}
                onSelect={onTaskSelect ? () => onTaskSelect(task) : undefined}
              />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Bu durumda görev yok
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
