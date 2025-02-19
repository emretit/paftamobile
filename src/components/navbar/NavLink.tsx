
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
        "flex items-center p-3 rounded-lg transition-colors",
        isCollapsed ? "justify-center" : "space-x-3",
        isActive ? "bg-gray-100 text-gray-900" : "hover:bg-gray-50"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
};

export default NavLink;
