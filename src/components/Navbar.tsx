
import { useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import NavHeader from "./navbar/NavHeader";
import NavLink from "./navbar/NavLink";
import { navItems, settingsItem } from "./navbar/nav-config";

interface NavbarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Navbar = ({ isCollapsed, setIsCollapsed }: NavbarProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className={cn(
      "fixed left-0 top-0 z-50 h-full shadow-xl bg-[#1A1F2C]",
      isCollapsed ? "w-[68px]" : "w-[250px]",
      "group transition-all duration-300 ease-in-out"
    )}>
      <nav className="flex h-full w-full flex-col">
        <NavHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        
        <div className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              isActive={isActive(item.path)}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>

        <Separator className="bg-[#9b87f5]/20" />
        
        <div className="p-3">
          <NavLink
            to={settingsItem.path}
            icon={settingsItem.icon}
            label={settingsItem.label}
            isActive={isActive(settingsItem.path)}
            isCollapsed={isCollapsed}
          />
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
