
import { ProposalStatus } from "@/types/proposal";
import { statusLabels, statusStyles } from "../constants";

interface StatusBadgeProps {
  status: ProposalStatus;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge = ({ status, size = "md" }: StatusBadgeProps) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base"
  };

  const style = statusStyles[status] || { bg: "bg-gray-400", text: "text-white" };
  const label = statusLabels[status] || status;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${style.bg} ${style.text} ${sizeClasses[size]}`}
    >
      {label}
    </span>
  );
};
