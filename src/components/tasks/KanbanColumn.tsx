
import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Task } from '@/types/task';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskSelect?: (task: Task) => void;
}

const KanbanColumn = ({
  id,
  title,
  tasks,
  onTaskEdit,
  onTaskSelect
}: KanbanColumnProps) => {
  return (
    <div className="flex flex-col h-full">
      <h3 className="font-medium text-sm mb-3 text-gray-500">{title} ({tasks.length})</h3>
      
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            className={`flex-1 p-2 rounded-md overflow-y-auto min-h-[500px] ${
              snapshot.isDraggingOver ? 'bg-gray-100' : 'bg-gray-50'
            }`}
            {...provided.droppableProps}
          >
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={() => onTaskEdit(task)}
                  onSelect={onTaskSelect ? () => onTaskSelect(task) : undefined}
                />
              ))
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">
                Bu durumda görev yok
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
