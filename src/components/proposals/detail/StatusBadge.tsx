
import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 'draft' | 'pending_approval' | 'sent' | 'accepted' | 'rejected' | 'expired';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const getStatusConfig = (status: StatusType) => {
    const configs = {
      draft: {
        label: "Hazırlanıyor",
        className: "bg-gray-100 text-gray-800 border-gray-200"
      },
      pending_approval: {
        label: "Onay Bekliyor",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200"
      },
      sent: {
        label: "Gönderildi",
        className: "bg-blue-100 text-blue-800 border-blue-200"
      },
      accepted: {
        label: "Kabul Edildi",
        className: "bg-green-100 text-green-800 border-green-200"
      },
      rejected: {
        label: "Reddedildi",
        className: "bg-red-100 text-red-800 border-red-200"
      },
      expired: {
        label: "Süresi Doldu",
        className: "bg-orange-100 text-orange-800 border-orange-200"
      }
    };
    
    return configs[status] || configs.draft;
  };
  
  const config = getStatusConfig(status);
  const sizeClasses = {
    sm: "py-0.5 px-2 text-xs",
    md: "py-1 px-2 text-sm",
    lg: "py-1.5 px-3 text-sm"
  };
  
  return (
    <span 
      className={cn(
        "inline-flex items-center rounded border font-medium",
        config.className,
        sizeClasses[size]
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
