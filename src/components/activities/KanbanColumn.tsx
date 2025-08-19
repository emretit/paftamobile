
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
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          className={`min-h-[500px] w-full p-3 rounded-md ${
            snapshot.isDraggingOver ? 'bg-red-50' : 'bg-gray-50'
          } transition-colors duration-200`}
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
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 border border-dashed border-gray-300 rounded-md mt-2">
              <p className="text-gray-500 text-sm">Bu durumda görev yok</p>
            </div>
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default KanbanColumn;
