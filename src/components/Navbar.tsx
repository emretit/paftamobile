
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, PieChart, ChevronLeft, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavbarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Navbar = ({ isCollapsed, setIsCollapsed }: NavbarProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className={cn(
      "fixed left-0 top-0 h-full flex transition-all duration-300 z-50",
      isCollapsed ? "w-[60px]" : "w-full sm:w-64"
    )}>
      <nav className="w-full bg-white p-4 relative">
        <div className={cn(
          "mb-8 flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && <h1 className="text-2xl font-bold text-primary">CRM</h1>}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="space-y-2">
          <Link
            to="/"
            className={cn(
              "flex items-center p-3 rounded-lg transition-colors",
              isCollapsed ? "justify-center" : "space-x-3",
              isActive("/") ? "bg-gray-100 text-gray-900" : "hover:bg-gray-50"
            )}
          >
            <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Gösterge Paneli</span>}
          </Link>
          
          <Link
            to="/contacts"
            className={cn(
              "flex items-center p-3 rounded-lg transition-colors",
              isCollapsed ? "justify-center" : "space-x-3",
              isActive("/contacts") ? "bg-gray-100 text-gray-900" : "hover:bg-gray-50"
            )}
          >
            <Users className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Müşteriler</span>}
          </Link>
          
          <Link
            to="/deals"
            className={cn(
              "flex items-center p-3 rounded-lg transition-colors",
              isCollapsed ? "justify-center" : "space-x-3",
              isActive("/deals") ? "bg-gray-100 text-gray-900" : "hover:bg-gray-50"
            )}
          >
            <PieChart className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Fırsatlar</span>}
          </Link>
        </div>
      </nav>
      <Separator orientation="vertical" className="h-full" />
    </div>
  );
};

export default Navbar;
