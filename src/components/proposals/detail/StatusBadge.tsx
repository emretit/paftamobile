
import { statusLabels, statusStyles } from "../constants";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const style = statusStyles[status] || { bg: "bg-gray-100", text: "text-gray-800" };
  const label = statusLabels[status] || status;
  
  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${style.bg} ${style.text}`}>
      {label}
    </span>
  );
};
