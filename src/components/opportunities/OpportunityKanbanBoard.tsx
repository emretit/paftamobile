import React from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
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
    handleUpdateColumnTitle
  } = useOpportunityColumns(Object.values(opportunities).flat(), onUpdateOpportunityStatus);

  return (
    <>
      <AddColumnButton onClick={() => setIsAddColumnOpen(true)} />
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex overflow-x-auto gap-4 pb-4">
          {columns.map((column) => (
            <div key={column.id} className="flex-none min-w-[300px]">
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
              <OpportunityColumn
                id={column.id as any}
                title={column.title}
                opportunities={opportunities[column.id] || []}
                onOpportunityClick={onOpportunityClick}
                onOpportunitySelect={onOpportunitySelect}
                selectedOpportunities={selectedOpportunities}
              />
            </div>
          ))}
        </div>
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