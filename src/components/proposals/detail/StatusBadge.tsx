
import React from 'react';
import { cn } from '@/lib/utils';
import { ProposalStatus, proposalStatusLabels, proposalStatusColors } from '@/types/proposal';

interface StatusBadgeProps {
  status: ProposalStatus;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const sizeClasses = {
    sm: "py-0.5 px-2 text-xs",
    md: "py-1 px-2 text-sm",
    lg: "py-1.5 px-3 text-sm"
  };
  
  return (
    <span 
      className={cn(
        "inline-flex items-center rounded border font-medium",
        proposalStatusColors[status],
        sizeClasses[size]
      )}
    >
      {proposalStatusLabels[status]}
    </span>
  );
};

export default StatusBadge;
