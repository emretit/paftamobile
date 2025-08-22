
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { safeSignOut } from "@/lib/supabase-utils";

export const useLogout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Güvenli logout işlemini gerçekleştir
      const result = await safeSignOut();
      
      if (result.success) {
        // Başarılı logout
        toast({
          title: "Başarılı",
          description: "Başarıyla çıkış yapıldı.",
        });
        
        // Ana sayfaya yönlendir
        navigate("/");
      } else {
        // Hata durumunda
        if (result.error?.includes('403') || result.error?.includes('403')) {
          toast({
            variant: "destructive",
            title: "Yetki Hatası",
            description: "Oturum kapatma yetkiniz bulunmuyor. Lütfen sayfayı yenileyin ve tekrar deneyin.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Hata",
            description: "Çıkış yapılırken bir sorun oluştu: " + (result.error || 'Bilinmeyen hata'),
          });
        }
      }
    } catch (error: any) {
      console.error('Unexpected logout error:', error);
      toast({
        variant: "destructive",
        title: "Beklenmeyen Hata",
        description: "Çıkış yapılırken beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    handleLogout,
    isLoggingOut
  };
};
