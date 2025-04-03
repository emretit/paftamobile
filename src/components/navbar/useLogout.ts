
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useLogout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Updated to use the correct method
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Çıkış yapılırken bir sorun oluştu.",
      });
    } else {
      toast({
        title: "Başarılı",
        description: "Başarıyla çıkış yapıldı.",
      });
      navigate("/");
    }
    setIsLoggingOut(false);
  };

  return {
    handleLogout,
    isLoggingOut
  };
};
