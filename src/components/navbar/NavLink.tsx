
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
          ? "bg-white/10 text-white border-r-2 border-white" 
          : "text-white/80 hover:bg-[#B22222] hover:text-white"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
};

export default NavLink;
