
import { useLocation, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import NavHeader from "./navbar/NavHeader";
import NavLink from "./navbar/NavLink";
import { navItems, settingsItem } from "./navbar/nav-config";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import UserMenu from "@/components/UserMenu";

interface NavbarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Navbar = ({ isCollapsed, setIsCollapsed }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["CRM"]);

  const toggleCategory = (category: string, path?: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    
    if (path) {
      navigate(path);
    }
  };

  // Helper function to check if an item is CRM-related
  const isCrmItem = (path: string) => {
    return path === "/crm" || path === "/deals" || path === "/proposals" || path === "/tasks";
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-20 transition-all duration-300 ${
        isCollapsed ? "w-[60px]" : "w-64"
      } border-r border-white/10 bg-gray-900 shadow-lg`}
    >
      <nav className="flex h-full w-full flex-col">
        <NavHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        
        <div className="flex-1 overflow-auto">
          {navItems.map((item, index) => {
            if ('category' in item) {
              const isExpanded = expandedCategories.includes(item.category);
              const Icon = item.icon;
              const isCrmCategory = item.category === "CRM";
              return (
                <div key={item.category}>
                  <button
                    onClick={() => toggleCategory(item.category, item.path)}
                    className={cn(
                      "flex items-center w-full h-11 px-3 rounded-md",
                      !isCollapsed && "justify-between",
                      isCrmCategory && "border-l-2 border-blue-400 mt-2", // Add divider for CRM category
                      isActive(item.path || '') 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <div className="flex items-center">
                      <Icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isCrmCategory && "text-blue-400" // Highlight CRM category icon
                      )} />
                      {!isCollapsed && (
                        <span className={cn(
                          "ml-3 text-sm font-medium",
                          isCrmCategory && "text-blue-400" // Highlight CRM category text
                        )}>{item.category}</span>
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
                          isCrmButton={isCrmCategory} // Set isCrmButton for CRM subitems
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
                isCrmButton={isCrmItem(item.path)} // Set isCrmButton based on path
              />
            );
          })}
        </div>

        <Separator className="bg-white/5" />
        
        <div className="p-3">
          <NavLink
            to={settingsItem.path}
            icon={settingsItem.icon}
            label={settingsItem.label}
            isActive={isActive(settingsItem.path)}
            isCollapsed={isCollapsed}
            isCrmButton={false}
          />
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          {!isCollapsed && <span className="text-sm font-medium text-gray-300">Hesap</span>}
          <UserMenu />
        </div>
      </div>
    </aside>
  );
};

export default Navbar;
