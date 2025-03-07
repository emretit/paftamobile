
import { Building, Calendar, CreditCard, Clock } from "lucide-react";
import { format } from "date-fns";
import { formatMoney } from "@/components/deals/utils";
import { Proposal } from "@/types/proposal";

interface ProposalBasicInfoProps {
  proposal: Proposal;
}

export const ProposalBasicInfo = ({ proposal }: ProposalBasicInfoProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Building className="h-4 w-4" />
        <span>{proposal.customer?.name || 'Belirtilmemiş'}</span>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Calendar className="h-4 w-4" />
        <span>
          {proposal.created_at ? format(new Date(proposal.created_at), 'dd.MM.yyyy') : 'Belirtilmemiş'}
        </span>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <CreditCard className="h-4 w-4" />
        <span>{formatMoney(proposal.total_value)}</span>
      </div>
      
      {proposal.valid_until && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>
            Geçerlilik: {format(new Date(proposal.valid_until), 'dd.MM.yyyy')}
          </span>
        </div>
      )}
    </div>
  );
};
