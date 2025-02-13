
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  PieChart, 
  ChevronLeft, 
  ChevronRight, 
  Truck,
  HardHat,
  Wallet,
  Wrench,
  FileDown,
  FileUp
} from "lucide-react";
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
            to="/suppliers"
            className={cn(
              "flex items-center p-3 rounded-lg transition-colors",
              isCollapsed ? "justify-center" : "space-x-3",
              isActive("/suppliers") ? "bg-gray-100 text-gray-900" : "hover:bg-gray-50"
            )}
          >
            <Truck className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Tedarikçiler</span>}
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

          <Link
            to="/employees"
            className={cn(
              "flex items-center p-3 rounded-lg transition-colors",
              isCollapsed ? "justify-center" : "space-x-3",
              isActive("/employees") ? "bg-gray-100 text-gray-900" : "hover:bg-gray-50"
            )}
          >
            <HardHat className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Çalışanlar</span>}
          </Link>

          <Link
            to="/finance"
            className={cn(
              "flex items-center p-3 rounded-lg transition-colors",
              isCollapsed ? "justify-center" : "space-x-3",
              isActive("/finance") ? "bg-gray-100 text-gray-900" : "hover:bg-gray-50"
            )}
          >
            <Wallet className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Finans</span>}
          </Link>

          <Link
            to="/service"
            className={cn(
              "flex items-center p-3 rounded-lg transition-colors",
              isCollapsed ? "justify-center" : "space-x-3",
              isActive("/service") ? "bg-gray-100 text-gray-900" : "hover:bg-gray-50"
            )}
          >
            <Wrench className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Servis</span>}
          </Link>

          <Link
            to="/purchase-invoices"
            className={cn(
              "flex items-center p-3 rounded-lg transition-colors",
              isCollapsed ? "justify-center" : "space-x-3",
              isActive("/purchase-invoices") ? "bg-gray-100 text-gray-900" : "hover:bg-gray-50"
            )}
          >
            <FileDown className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Alış Faturaları</span>}
          </Link>

          <Link
            to="/sales-invoices"
            className={cn(
              "flex items-center p-3 rounded-lg transition-colors",
              isCollapsed ? "justify-center" : "space-x-3",
              isActive("/sales-invoices") ? "bg-gray-100 text-gray-900" : "hover:bg-gray-50"
            )}
          >
            <FileUp className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Satış Faturaları</span>}
          </Link>
        </div>
      </nav>
      <Separator orientation="vertical" className="h-full" />
    </div>
  );
};

export default Navbar;
