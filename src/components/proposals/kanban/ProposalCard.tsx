
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, User2Icon, CreditCardIcon } from "lucide-react";
import { Proposal, proposalStatusColors } from "@/types/proposal";
import { format } from "date-fns";

interface ProposalCardProps {
  proposal: Proposal;
  onClick: (proposal: Proposal) => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onClick }) => {
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
    <Card 
      className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(proposal)}
    >
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium flex justify-between items-start">
          <span className="truncate">
            {proposal.title || `Teklif #${proposal.proposal_number}`}
          </span>
          <Badge className={proposalStatusColors[proposal.status]}>
            {proposal.status === "draft" && "Taslak"}
            {proposal.status === "pending_approval" && "Onay Bekliyor"}
            {proposal.status === "sent" && "Gönderildi"}
            {proposal.status === "accepted" && "Kabul Edildi"}
            {proposal.status === "rejected" && "Reddedildi"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-xs space-y-2">
        <div className="flex items-center text-gray-600">
          <User2Icon className="h-3.5 w-3.5 mr-2" />
          {proposal.customer?.name || "İsimsiz Müşteri"}
        </div>
        {proposal.total_value && (
          <div className="flex items-center text-gray-600">
            <CreditCardIcon className="h-3.5 w-3.5 mr-2" />
            {formatMoney(proposal.total_value)}
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
  );
};

export default ProposalCard;
