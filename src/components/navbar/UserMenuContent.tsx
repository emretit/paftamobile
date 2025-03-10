
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, LogOut, Settings } from "lucide-react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface UserMenuContentProps {
  user: User;
  onLogout: () => void;
}

const UserMenuContent = ({ user, onLogout }: UserMenuContentProps) => {
  const navigate = useNavigate();

  return (
    <DropdownMenuContent align="end" className="w-56">
      <div className="flex items-center justify-start gap-2 p-2">
        <div className="flex flex-col space-y-1 leading-none">
          {user.user_metadata?.full_name && (
            <p className="font-medium">{user.user_metadata.full_name}</p>
          )}
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => navigate("/profile")}>
        <UserIcon className="mr-2 h-4 w-4" />
        <span>Profil</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigate("/settings")}>
        <Settings className="mr-2 h-4 w-4" />
        <span>Ayarlar</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        <span>Çıkış Yap</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
};

export default UserMenuContent;
