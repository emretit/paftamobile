
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavHeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const NavHeader = ({ isCollapsed, setIsCollapsed }: NavHeaderProps) => {
  return (
    <div className={cn(
      "flex h-20 items-center border-b border-[#9e1c2c]/20 bg-[#1A1F2C] px-6 transition-all duration-300",
      isCollapsed ? "justify-center" : "justify-between"
    )}>
      <div className="flex items-center space-x-3">
        {!isCollapsed && (
          <>
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-[#9e1c2c]/20 blur-sm group-hover:blur-md transition-all duration-300 opacity-75"></div>
              <img 
                src="/logo.png" 
                alt="NGS Logo" 
                className="relative h-10 w-10 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">NGS</span>
          </>
        )}
        {isCollapsed && (
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-[#9e1c2c]/20 blur-sm group-hover:blur-md transition-all duration-300 opacity-75"></div>
            <img 
              src="/logo.png" 
              alt="NGS Logo" 
              className="relative h-9 w-9 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:bg-[#9e1c2c]/20"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white hover:bg-[#9e1c2c]/20"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>Profilim</DropdownMenuItem>
            <DropdownMenuItem>Ayarlar</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Çıkış Yap</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-9 w-9 text-white hover:bg-[#9e1c2c]/20"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default NavHeader;
