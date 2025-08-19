import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Opportunity } from "@/types/crm";
import OpportunityColumn from "./OpportunityColumn";
import AddColumnButton from "./AddColumnButton";
import ColumnHeader from "./ColumnHeader";
import AddColumnDialog from "./dialogs/AddColumnDialog";
import DeleteColumnDialog from "./dialogs/DeleteColumnDialog";
import { useOpportunityColumns } from "./hooks/useOpportunityColumns";

interface OpportunitiesState {
  [key: string]: Opportunity[];
}

interface OpportunityKanbanBoardProps {
  opportunities: OpportunitiesState;
  onDragEnd: (result: DropResult) => void;
  onOpportunityClick: (opportunity: Opportunity) => void;
  onOpportunitySelect?: (opportunity: Opportunity) => void;
  selectedOpportunities?: Opportunity[];
  onUpdateOpportunityStatus: (id: string, status: string) => Promise<void>;
}

const OpportunityKanbanBoard: React.FC<OpportunityKanbanBoardProps> = ({
  opportunities,
  onDragEnd,
  onOpportunityClick,
  onOpportunitySelect,
  selectedOpportunities = [],
  onUpdateOpportunityStatus
}) => {
  const {
    columns,
    isAddColumnOpen,
    setIsAddColumnOpen,
    newColumnTitle,
    setNewColumnTitle,
    columnToDelete,
    setColumnToDelete,
    handleAddColumn,
    handleDeleteColumn,
    confirmDeleteColumn,
    isDefaultColumn,
    handleUpdateColumnTitle,
    handleReorderColumns
  } = useOpportunityColumns(Object.values(opportunities).flat(), onUpdateOpportunityStatus);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;

    // If it's a column reorder
    if (type === "COLUMN") {
      handleReorderColumns(source.index, destination.index);
      return;
    }

    // Otherwise, pass to the original drag handler for opportunities
    onDragEnd(result);
  };

  return (
    <>
      <AddColumnButton onClick={() => setIsAddColumnOpen(true)} />
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div 
              className="flex overflow-x-auto gap-3 pb-4"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {columns.map((column, index) => (
                <Draggable key={column.id} draggableId={column.id} index={index}>
                  {(provided, snapshot) => (
                     <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex-none min-w-[280px] ${snapshot.isDragging ? 'opacity-80' : ''}`}
                    >
                      <div 
                        className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${snapshot.isDragging ? 'shadow-lg border-primary' : ''}`}
                      >
                        <div 
                          className="p-3 bg-white/95 backdrop-blur-sm rounded-t-lg border-b border-gray-100 cursor-grab"
                          {...provided.dragHandleProps}
                        >
                          <ColumnHeader
                            id={column.id}
                            title={column.title}
                            icon={column.icon}
                            color={column.color}
                            opportunityCount={opportunities[column.id]?.length || 0}
                            onDeleteColumn={handleDeleteColumn}
                            onUpdateTitle={handleUpdateColumnTitle}
                            isDefaultColumn={isDefaultColumn(column.id)}
                          />
                        </div>
                        <div className="p-2 bg-white/90 rounded-b-lg">
                          <OpportunityColumn
                            id={column.id as any}
                            title={column.title}
                            opportunities={opportunities[column.id] || []}
                            onOpportunityClick={onOpportunityClick}
                            onOpportunitySelect={onOpportunitySelect}
                            selectedOpportunities={selectedOpportunities}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <AddColumnDialog
        isOpen={isAddColumnOpen}
        onClose={() => setIsAddColumnOpen(false)}
        newColumnTitle={newColumnTitle}
        setNewColumnTitle={setNewColumnTitle}
        handleAddColumn={handleAddColumn}
      />

      <DeleteColumnDialog
        columnToDelete={columnToDelete}
        columns={columns}
        onClose={() => setColumnToDelete(null)}
        onConfirmDelete={confirmDeleteColumn}
      />
    </>
  );
};

export default OpportunityKanbanBoard;