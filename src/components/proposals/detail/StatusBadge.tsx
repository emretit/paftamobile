
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ProposalStatus, proposalStatusLabels, proposalStatusColors } from "@/types/proposal";

interface StatusBadgeProps {
  status: ProposalStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <Badge className={proposalStatusColors[status]}>
      {proposalStatusLabels[status]}
    </Badge>
  );
};

export default StatusBadge;
