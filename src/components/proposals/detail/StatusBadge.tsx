
import { statusStyles, statusLabels } from "../constants";
import { ProposalStatus } from "@/types/proposal";

interface StatusBadgeProps {
  status: ProposalStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const style = statusStyles[status] || { bg: "bg-gray-100", text: "text-gray-800" };
  const label = statusLabels[status] || status.replace(/_/g, ' ');
  
  // Define icons for specific statuses
  let statusIcon = "";
  
  switch (status) {
    case "discovery_scheduled":
      statusIcon = "🔎";
      break;
    case "meeting_completed":
      statusIcon = "✅";
      break;
    case "quote_in_progress":
      statusIcon = "📝";
      break;
    case "approved":
    case "accepted":
      statusIcon = "✅";
      break;
    case "rejected":
      statusIcon = "❌";
      break;
    case "converted_to_order":
      statusIcon = "📦";
      break;
    case "sent":
    case "quote_sent":
      statusIcon = "📤";
      break;
    case "negotiation":
      statusIcon = "🤝";
      break;
    default:
      break;
  }
  
  return (
    <span className={`px-3 py-1 rounded-full font-medium ${style.bg} ${style.text} flex items-center gap-1 text-sm`}>
      {statusIcon && <span>{statusIcon}</span>}
      {label}
    </span>
  );
};
