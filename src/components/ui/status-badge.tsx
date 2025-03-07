
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "error" | "info" | "neutral" | "custom";
  customColors?: {
    bg: string;
    text: string;
  };
  size?: "sm" | "md" | "lg";
}

export const StatusBadge = ({
  label,
  variant = "default",
  customColors,
  size = "md",
}: StatusBadgeProps) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const variantClasses = {
    default: "bg-primary/20 text-primary",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    neutral: "bg-gray-100 text-gray-800",
    custom: customColors ? `${customColors.bg} ${customColors.text}` : "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        sizeClasses[size],
        variantClasses[variant]
      )}
    >
      {label}
    </span>
  );
};
