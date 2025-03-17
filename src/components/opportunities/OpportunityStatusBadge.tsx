
import { Badge } from "@/components/ui/badge";
import { 
  OpportunityStatus, 
  opportunityStatusLabels, 
  opportunityStatusColors 
} from "@/types/crm";

interface OpportunityStatusBadgeProps {
  status: OpportunityStatus;
}

const OpportunityStatusBadge = ({ status }: OpportunityStatusBadgeProps) => {
  return (
    <Badge className={opportunityStatusColors[status] || "bg-gray-500 text-white"}>
      {opportunityStatusLabels[status] || status}
    </Badge>
  );
};

export default OpportunityStatusBadge;
