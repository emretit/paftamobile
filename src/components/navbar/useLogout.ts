
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/auth/AuthContext";

export const useLogout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Auth context'ten signOut çağır
      await signOut();

      // Başarılı logout
      toast({
        title: "Başarılı",
        description: "Başarıyla çıkış yapıldı.",
      });

      // Sign-in sayfasına yönlendir
      navigate("/signin");
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Session errors are expected and should be treated as success
      if (error.message?.includes('session_not_found') || error.message?.includes('Session not found')) {
        toast({
          title: "Başarılı",
          description: "Başarıyla çıkış yapıldı.",
        });
        navigate("/signin");
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Çıkış yapılırken bir sorun oluştu.",
        });
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    handleLogout,
    isLoggingOut
  };
};
