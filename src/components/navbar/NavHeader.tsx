
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavHeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const NavHeader = ({ isCollapsed, setIsCollapsed }: NavHeaderProps) => {
  return (
    <div className={cn(
      "flex h-20 items-center border-b border-white/20 px-6 transition-all duration-300",
      isCollapsed ? "justify-center" : "justify-between"
    )}>
      <div className="flex items-center space-x-3">
        {!isCollapsed && (
          <>
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-white/10 blur-sm group-hover:blur-md transition-all duration-300 opacity-75"></div>
              <img 
                src="/logo.png" 
                alt="NGS Logo" 
                className="relative h-10 w-10 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="text-lg font-semibold tracking-tight text-primary">NGS</span>
          </>
        )}
        {isCollapsed && (
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-white/10 blur-sm group-hover:blur-md transition-all duration-300 opacity-75"></div>
            <img 
              src="/logo.png" 
              alt="NGS Logo" 
              className="relative h-9 w-9 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="h-9 w-9 text-primary hover:bg-white/10"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default NavHeader;
