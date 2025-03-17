
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { statusStyles } from "../constants";
import { ProposalStatus } from "@/types/proposal";

interface StatusBadgeProps {
  status: ProposalStatus;
  size?: "sm" | "lg";
  className?: string;
}

const StatusBadge = ({ status, size = "sm", className }: StatusBadgeProps) => {
  const statusStyle = statusStyles[status] || "bg-gray-100 text-gray-800";
  
  let displayText = "";
  switch (status) {
    case "draft":
      displayText = "Taslak";
      break;
    case "pending_approval":
      displayText = "Onay Bekliyor";
      break;
    case "sent":
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
    default:
      displayText = status;
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
