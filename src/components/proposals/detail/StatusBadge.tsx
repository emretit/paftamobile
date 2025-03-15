
import { statusStyles } from "../constants";
import { ProposalStatus } from "@/types/proposal";

interface StatusBadgeProps {
  status: ProposalStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const style = statusStyles[status] || { bg: "bg-gray-100", text: "text-gray-800" };
  
  let statusText = "";
  let statusIcon = "";
  
  switch (status) {
    case "discovery_scheduled":
    case "meeting_completed":
      statusText = "Discovery Done";
      statusIcon = "🔎";
      break;
    case "approved":
      statusText = "Approved";
      statusIcon = "✅";
      break;
    case "rejected":
      statusText = "Rejected";
      statusIcon = "❌";
      break;
    case "converted_to_order":
      statusText = "Ordered";
      statusIcon = "📦";
      break;
    default:
      statusText = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
      break;
  }
  
  return (
    <span className={`px-3 py-1 rounded-full font-medium ${style.bg} ${style.text} flex items-center gap-1 text-sm`}>
      {statusIcon && <span>{statusIcon}</span>}
      {statusText}
    </span>
  );
};
