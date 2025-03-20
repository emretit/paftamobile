
import React from 'react';
import { cn } from '@/lib/utils';
import { ProposalStatus, proposalStatusLabels, proposalStatusColors } from '@/types/proposal';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: ProposalStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusBadge = ({ status, size = 'md', className }: StatusBadgeProps) => {
  const sizeClasses = {
    sm: "py-0.5 px-2 text-xs",
    md: "py-1 px-2 text-sm",
    lg: "py-1.5 px-3 text-sm"
  };
  
  return (
    <Badge 
      className={cn(
        "font-medium border",
        proposalStatusColors[status],
        sizeClasses[size],
        className
      )}
      variant="secondary"
    >
      {proposalStatusLabels[status]}
    </Badge>
  );
};

export default StatusBadge;
