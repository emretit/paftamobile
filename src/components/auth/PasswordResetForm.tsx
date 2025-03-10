
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface PasswordResetFormProps {
  onSuccess: () => void;
  onBackToSignIn: () => void;
  onError: (error: string | null) => void;
}

export const PasswordResetForm = ({ 
  onSuccess, 
  onBackToSignIn,
  onError 
}: PasswordResetFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onError(null);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname,
    });

    if (error) {
      onError(error.message);
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    } else {
      onSuccess();
      toast({
        title: "E-posta Gönderildi",
        description: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
      });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handlePasswordReset} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col space-y-2">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "İşleniyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBackToSignIn} 
          className="w-full"
        >
          Geri Dön
        </Button>
      </div>
    </form>
  );
};
