
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
  );
};

export default NavHeader;
