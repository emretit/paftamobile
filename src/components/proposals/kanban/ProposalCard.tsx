
import React from "react";
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, User2Icon, CreditCardIcon } from "lucide-react";
import { Proposal } from "@/types/proposal";
import StatusBadge from "../detail/StatusBadge";
import { format } from "date-fns";

interface ProposalCardProps {
  proposal: Proposal;
  index: number;
  onClick: (proposal: Proposal) => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, index, onClick }) => {
  const formatMoney = (amount: number) => {
    if (!amount && amount !== 0) return "₺0";
    
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Draggable draggableId={proposal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 ${snapshot.isDragging ? 'opacity-75' : ''}`}
        >
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onClick(proposal)}
          >
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex justify-between items-start">
                <span className="truncate">
                  {proposal.title || `Teklif #${proposal.number || proposal.proposal_number}`}
                </span>
                <StatusBadge status={proposal.status} size="sm" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs space-y-2">
              <div className="flex items-center text-gray-600">
                <User2Icon className="h-3.5 w-3.5 mr-2" />
                {proposal.customer?.name || proposal.customer_name || "İsimsiz Müşteri"}
              </div>
              {(proposal.total_amount || proposal.total_value) && (
                <div className="flex items-center text-gray-600">
                  <CreditCardIcon className="h-3.5 w-3.5 mr-2" />
                  {formatMoney(proposal.total_amount || proposal.total_value || 0)}
                </div>
              )}
              {proposal.valid_until && (
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                  {format(new Date(proposal.valid_until), "dd.MM.yyyy")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default ProposalCard;
