
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, FileText, Building, User } from "lucide-react";
import { format, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/components/deals/utils";
import type { Proposal } from "@/types/proposal";

interface ProposalCardProps {
  proposal: Proposal;
  onSelect: (proposal: Proposal) => void;
}

const ProposalCard = ({ proposal, onSelect }: ProposalCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "border-l-green-500";
      case "rejected":
        return "border-l-red-500";
      case "sent":
        return "border-l-yellow-500";
      case "new":
        return "border-l-blue-500";
      default:
        return "border-l-gray-300";
    }
  };
  
  const isOverdue = proposal.valid_until && isPast(new Date(proposal.valid_until)) && proposal.status !== "accepted" && proposal.status !== "rejected";

  return (
    <Card 
      className={cn(
        "p-4 hover:shadow-md transition-all duration-200 bg-white border border-border/50 hover:border-[#9b87f5]/30 border-l-4 group cursor-pointer",
        getStatusColor(proposal.status)
      )}
      onClick={() => onSelect(proposal)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <div>
              <h3 className="font-medium text-gray-900 group-hover:text-[#9b87f5] transition-colors">
                #{proposal.proposal_number} - {proposal.title}
              </h3>
              {proposal.customer && (
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {proposal.customer.name}
                </p>
              )}
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700`}>
            {formatMoney(proposal.total_value)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-2">
          {proposal.employee && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback>{proposal.employee.first_name?.charAt(0)}{proposal.employee.last_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">{proposal.employee.first_name} {proposal.employee.last_name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          {proposal.valid_until && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              isOverdue ? "text-red-600 font-medium" : "text-gray-500"
            )}>
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(proposal.valid_until), 'dd MMM yyyy')}</span>
              {isOverdue && <span className="text-red-600 ml-1">(Süresi Dolmuş)</span>}
            </div>
          )}

          <div className="flex items-center gap-2">
            {proposal.items && Array.isArray(proposal.items) && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <FileText className="h-3 w-3" />
                <span>{proposal.items.length} Ürün</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProposalCard;
