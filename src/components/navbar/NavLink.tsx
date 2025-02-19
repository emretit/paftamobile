
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
}

const NavLink = ({ to, icon: Icon, label, isActive, isCollapsed }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center h-11 transition-colors rounded-md",
        isCollapsed ? "justify-center px-3" : "px-3 space-x-3",
        isActive 
          ? "bg-primary/5 text-primary hover:bg-primary/10" 
          : "text-[#403E43] hover:bg-muted hover:text-foreground dark:text-gray-200"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
};

export default NavLink;
