
import { Button } from "@/components/ui/button";

interface ResetSuccessProps {
  onBackToSignIn: () => void;
}

export const ResetSuccess = ({ onBackToSignIn }: ResetSuccessProps) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 text-green-800 rounded-md">
        Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.
      </div>
      <Button 
        type="button" 
        className="w-full" 
        onClick={onBackToSignIn}
      >
        Giriş Sayfasına Dön
      </Button>
    </div>
  );
};
