
import { DragDropContext } from "@hello-pangea/dnd";
import TaskColumn from "../tasks/TaskColumn";
import { usePipelineItems } from "./hooks/usePipelineItems";
import { usePipelineMutations } from "./hooks/usePipelineMutations";
import { PIPELINE_COLUMNS } from "./constants";
import { filterItems } from "./utils/filterItems";
import type { Task } from "@/types/task";
import type { Deal } from "@/types/deal";

interface UnifiedPipelineProps {
  searchQuery?: string;
  selectedEmployee?: string | null;
  selectedType?: string | null;
  onEditTask?: (task: Task) => void;
  onSelectTask?: (task: Task) => void;
  onEditDeal?: (deal: Deal) => void;
  onSelectDeal?: (deal: Deal) => void;
}

const UnifiedPipeline = ({ 
  searchQuery = "", 
  selectedEmployee, 
  selectedType,
  onEditTask,
  onSelectTask,
  onEditDeal,
  onSelectDeal
}: UnifiedPipelineProps) => {
  const { items, setItems, isLoading, error } = usePipelineItems();
  const updateItemMutation = usePipelineMutations();

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as Task['status'];
    if (newStatus !== 'todo' && newStatus !== 'in_progress' && newStatus !== 'completed') {
      return;
    }

    const newItems = Array.from(items);
    const item = newItems.find(t => t.id === draggableId);
    if (item) {
      item.status = newStatus;
      setItems(newItems);

      await updateItemMutation.mutateAsync({
        id: draggableId,
        status: newStatus,
        itemType: item.item_type
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-red-500">Hata: {error.message}</div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col lg:flex-row gap-6">
        {PIPELINE_COLUMNS.map((column) => (
          <TaskColumn
            key={column.id}
            id={column.id}
            title={column.title}
            icon={column.icon}
            tasks={filterItems(items, column.id, searchQuery, selectedEmployee, selectedType)}
            onEdit={(task) => {
              if (task.item_type === "task") {
                onEditTask?.(task);
              } else {
                onEditDeal?.(task as unknown as Deal);
              }
            }}
            onSelect={(task) => {
              if (task.item_type === "task") {
                onSelectTask?.(task);
              } else {
                onSelectDeal?.(task as unknown as Deal);
              }
            }}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default UnifiedPipeline;
