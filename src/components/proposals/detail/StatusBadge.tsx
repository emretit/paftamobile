
import React from "react";
import { ProposalStatusShared } from "@/types/shared-types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ProposalStatusShared | string;
  className?: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  hazirlaniyor: "bg-gray-100 text-gray-800",
  pending_approval: "bg-amber-100 text-amber-800",
  onay_bekliyor: "bg-amber-100 text-amber-800",
  sent: "bg-blue-100 text-blue-800",
  gonderildi: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800"
};

const statusLabels: Record<string, string> = {
  draft: "Taslak",
  hazirlaniyor: "Hazırlanıyor",
  pending_approval: "Onay Bekliyor",
  onay_bekliyor: "Onay Bekliyor",
  sent: "Gönderildi",
  gonderildi: "Gönderildi",
  accepted: "Kabul Edildi",
  rejected: "Reddedildi",
  expired: "Süresi Doldu"
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const color = statusColors[status] || "bg-gray-100 text-gray-800";
  const label = statusLabels[status] || status;

  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", color, className)}>
      {label}
    </span>
  );
};

export default StatusBadge;
