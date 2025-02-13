
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bell } from "lucide-react";

export const TopBar = () => {
  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Çalışan Yönetimi</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Separator orientation="vertical" className="h-8" />
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>YK</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">Yönetici Kullanıcı</p>
            <p className="text-xs text-gray-500">yonetici@firma.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};
