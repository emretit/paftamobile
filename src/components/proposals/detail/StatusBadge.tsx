
import { ProposalStatus } from "@/types/proposal";
import { statusStyles, statusLabels } from "../constants";

interface StatusBadgeProps {
  status: ProposalStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const style = statusStyles[status];
  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${style.bg} ${style.text}`}>
      {statusLabels[status]}
    </span>
  );
};
