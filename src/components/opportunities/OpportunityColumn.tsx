
import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Opportunity, OpportunityStatus } from '@/types/crm';
import OpportunityCard from './OpportunityCard';

// Get appropriate background color for each column
const getColumnBackground = (status: string) => {
  switch (status) {
    case 'new': return 'kanban-bg-new';
    case 'contacted': return 'kanban-bg-contacted';
    case 'qualified': return 'kanban-bg-qualified';
    case 'proposal': return 'kanban-bg-proposal';
    case 'negotiation': return 'kanban-bg-negotiation';
    case 'closed': return 'kanban-bg-closed';
    case 'lost': return 'kanban-bg-lost';
    default: return 'bg-gray-50';
  }
};

interface OpportunityColumnProps {
  id: OpportunityStatus;
  title: string;
  opportunities: Opportunity[];
  onOpportunityClick: (opportunity: Opportunity) => void;
  onOpportunitySelect?: (opportunity: Opportunity) => void;
  selectedOpportunities?: Opportunity[];
}

const OpportunityColumn = ({
  id,
  title,
  opportunities,
  onOpportunityClick,
  onOpportunitySelect,
  selectedOpportunities = []
}: OpportunityColumnProps) => {
  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          className={`min-h-[400px] w-full p-2 rounded-md transition-colors duration-200 ${
            snapshot.isDraggingOver ? 'bg-red-50' : getColumnBackground(id)
          }`}
          {...provided.droppableProps}
        >
          {opportunities.map((opportunity, index) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              index={index}
              onClick={() => onOpportunityClick(opportunity)}
              onSelect={onOpportunitySelect ? () => onOpportunitySelect(opportunity) : undefined}
              isSelected={selectedOpportunities.some(o => o.id === opportunity.id)}
            />
          ))}
          {opportunities.length === 0 && (
            <div className="flex flex-col items-center justify-center h-24 border border-dashed border-gray-300 rounded-md mt-1">
              <p className="text-gray-400 text-xs">Bu durumda fırsat yok</p>
            </div>
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default OpportunityColumn;
