
import { cn } from "@/lib/utils";
import { statusLabels, statusStyles } from "../constants";
import { ProposalStatus } from "@/types/crm";

interface StatusBadgeProps {
  status: ProposalStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", statusStyles[status], className)}>
      {statusLabels[status]}
    </span>
  );
};

export default StatusBadge;
