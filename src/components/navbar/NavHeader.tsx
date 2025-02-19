
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
      "flex h-16 items-center border-b bg-[#221F26] px-4",
      isCollapsed ? "justify-center" : "justify-between"
    )}>
      {!isCollapsed && (
        <div className="flex items-center space-x-2">
          <img 
            src="/logo.png" 
            alt="NGS Logo" 
            className="h-8 w-8"
          />
          <span className="text-lg font-semibold tracking-tight text-white">NGS</span>
        </div>
      )}
      {isCollapsed && (
        <img 
          src="/logo.png" 
          alt="NGS Logo" 
          className="h-8 w-8"
        />
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="h-9 w-9 text-white hover:bg-[#ea384c]/10"
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
