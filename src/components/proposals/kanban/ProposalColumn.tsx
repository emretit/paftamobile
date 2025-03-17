
import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Proposal } from '@/types/proposal';
import ProposalCard from './ProposalCard';

interface ProposalColumnProps {
  id: string;
  title: string;
  proposals: Proposal[];
  onProposalClick: (proposal: Proposal) => void;
}

const ProposalColumn = ({
  id,
  title,
  proposals,
  onProposalClick
}: ProposalColumnProps) => {
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
          {proposals.map((proposal, index) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onClick={onProposalClick}
            />
          ))}
          {proposals.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 border border-dashed border-gray-300 rounded-md mt-2">
              <p className="text-gray-500 text-sm">Bu durumda teklif yok</p>
            </div>
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default ProposalColumn;
