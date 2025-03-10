
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SignUpFormProps {
  onSignUpSuccess: () => void;
  onError: (error: string | null) => void;
}

export const SignUpForm = ({ onSignUpSuccess, onError }: SignUpFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onError(null);
    
    if (!companyName.trim()) {
      onError("Şirket adı gereklidir.");
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen şirket adını giriniz.",
      });
      setLoading(false);
      return;
    }
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          company_name: companyName,
          is_primary_account: true
        }
      }
    });

    if (error) {
      onError(error.message);
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    } else {
      toast({
        title: "Başarılı",
        description: "Hesabınız oluşturuldu. Giriş yapabilirsiniz.",
      });
      onSignUpSuccess();
    }
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Adınız Soyadınız"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="Şirket Adı"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
      </Button>
    </form>
  );
};
