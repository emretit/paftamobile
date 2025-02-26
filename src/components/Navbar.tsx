
import { useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import NavHeader from "./navbar/NavHeader";
import NavLink from "./navbar/NavLink";
import { navItems, settingsItem } from "./navbar/nav-config";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Navbar = ({ isCollapsed, setIsCollapsed }: NavbarProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["CRM"]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 z-50 h-full shadow-xl bg-[#1A1F2C]",
      isCollapsed ? "w-[68px]" : "w-[250px]",
      "group transition-all duration-300 ease-in-out"
    )}>
      <nav className="flex h-full w-full flex-col">
        <NavHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        
        <div className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item, index) => {
            if ('category' in item) {
              const isExpanded = expandedCategories.includes(item.category);
              const Icon = item.icon;
              return (
                <div key={item.category}>
                  <button
                    onClick={() => toggleCategory(item.category)}
                    className={cn(
                      "flex items-center w-full h-11 px-3 rounded-md text-white/80 hover:bg-[#9e1c2c]/20 hover:text-white",
                      !isCollapsed && "justify-between"
                    )}
                  >
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="ml-3">{item.category}</span>
                      )}
                    </div>
                    {!isCollapsed && (
                      isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isExpanded && !isCollapsed && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.items.map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          icon={subItem.icon}
                          label={subItem.label}
                          isActive={isActive(subItem.path)}
                          isCollapsed={isCollapsed}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                icon={item.icon}
                label={item.label}
                isActive={isActive(item.path)}
                isCollapsed={isCollapsed}
              />
            );
          })}
        </div>

        <Separator className="bg-[#9e1c2c]/20" />
        
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
