
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { useLogout } from "@/components/navbar/useLogout";
import { useCompanies } from "@/hooks/useCompanies";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const TopBar = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { user } = useUsers(userId);
  
  // Debug için console.log ekleyelim
  console.log('TopBar - userId:', userId);
  console.log('TopBar - user:', user);
  
  // Kullanıcı adı ve baş harfleri
  const displayName = user?.full_name || 'Kullanıcı';
  const userInitials = user?.full_name 
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'KU';
  const { handleLogout } = useLogout();
  const { company, isLoading } = useCompanies();
  
  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-gray-900">
            {isLoading ? "Yükleniyor..." : company?.name || "Firma Adı"}
          </h1>
          <p className="text-sm text-gray-600">
            {displayName}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Separator orientation="vertical" className="h-8" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar>
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500">{userId || ""}</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleProfileClick}>Profilim</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>Ayarlar</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onSelect={handleLogout}>Çıkış Yap</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopBar;
