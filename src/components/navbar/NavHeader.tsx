
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
      "flex h-20 items-center border-b border-white/10 px-6 transition-all duration-300",
      isCollapsed ? "justify-center" : "justify-between"
    )}>
      <div className="flex items-center space-x-3">
        {!isCollapsed && (
          <>
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold text-white tracking-tight">PAFTA</span>
              <span className="text-[10px] text-gray-300 -mt-1 tracking-widest">İş Yönetim Sistemi</span>
            </div>
          </>
        )}
        {isCollapsed && (
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-white tracking-tight">PAFTA</span>
            <span className="text-[8px] text-gray-300 -mt-1 tracking-wider">İş</span>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="h-9 w-9 text-gray-300 hover:bg-gray-800 hover:text-white"
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
