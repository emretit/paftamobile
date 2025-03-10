
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface UserMenuAvatarProps {
  user: User | null;
  loading: boolean;
  userInitials: string;
}

const UserMenuAvatar = ({ user, loading, userInitials }: UserMenuAvatarProps) => {
  if (loading) {
    return <Button variant="ghost" size="sm" disabled>Yükleniyor...</Button>;
  }

  if (!user) {
    return null;
  }

  return (
    <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{userInitials}</AvatarFallback>
      </Avatar>
    </Button>
  );
};

export default UserMenuAvatar;
