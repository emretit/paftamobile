
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { LucideIcon } from "lucide-react";
import TaskCard from "./TaskCard";
import type { Task } from "@/types/task";

interface TaskColumnProps {
  id: string;
  title: string;
  icon: LucideIcon;
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onSelect?: (task: Task) => void;
}

const TaskColumn = ({ id, title, icon: Icon, tasks, onEdit, onSelect }: TaskColumnProps) => {
  return (
    <div className="flex-1 min-w-[300px]">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-gray-500" />
        <h2 className="font-semibold text-gray-900">
          {title} ({tasks.length})
        </h2>
      </div>
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-4 min-h-[500px] p-4 rounded-lg ${
              snapshot.isDraggingOver ? "bg-gray-100" : "bg-gray-50"
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? "shadow-lg" : ""}
                  >
                    <TaskCard task={task} onEdit={onEdit} onSelect={onSelect} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskColumn;
