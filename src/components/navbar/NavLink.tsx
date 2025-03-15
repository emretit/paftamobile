
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  isCrmButton?: boolean; // New prop to identify CRM buttons
}

const NavLink = ({ 
  to, 
  icon: Icon, 
  label, 
  isActive, 
  isCollapsed,
  isCrmButton = false 
}: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center h-11 transition-colors rounded-md",
        isCollapsed ? "justify-center px-3" : "px-3 space-x-3",
        isActive 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-gray-300 hover:bg-gray-800 hover:text-white",
        isCrmButton && "border-l-2 border-blue-400" // Special styling for CRM buttons
      )}
    >
      <Icon className={cn(
        "h-5 w-5 flex-shrink-0",
        isCrmButton && "text-blue-400" // Highlight CRM button icons
      )} />
      {!isCollapsed && <span className="text-sm">{label}</span>}
    </Link>
  );
};

export default NavLink;
