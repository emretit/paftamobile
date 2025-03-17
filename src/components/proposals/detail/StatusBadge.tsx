
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { statusStyles } from "../constants";
import { ProposalStatus } from "@/types/proposal";
import { ProposalStatusShared } from "@/types/shared-types";

interface StatusBadgeProps {
  status: ProposalStatus | ProposalStatusShared;
  size?: "sm" | "lg";
  className?: string;
}

const StatusBadge = ({ status, size = "sm", className }: StatusBadgeProps) => {
  // Get status style, falling back to gray if not found
  const statusStyle = statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800";
  
  let displayText = "";
  
  // Handle all possible status values
  switch (status) {
    case "draft":
    case "hazirlaniyor":
      displayText = "Taslak";
      break;
    case "pending_approval":
    case "onay_bekliyor":
      displayText = "Onay Bekliyor";
      break;
    case "sent":
    case "gonderildi":
      displayText = "Gönderildi";
      break;
    case "accepted":
      displayText = "Kabul Edildi";
      break;
    case "rejected":
      displayText = "Reddedildi";
      break;
    case "expired":
      displayText = "Süresi Dolmuş";
      break;
    case "pending":
      displayText = "Beklemede";
      break;
    case "preparing":
      displayText = "Hazırlanıyor";
      break;
    default:
      displayText = String(status);
  }
  
  return (
    <Badge
      variant="secondary"
      className={cn(
        statusStyle,
        size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs",
        className
      )}
    >
      {displayText}
    </Badge>
  );
};

export default StatusBadge;
