import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ErrorDisplay } from "@/components/auth/ErrorDisplay";
import { Lock, User, Eye, EyeOff, Home, Mail } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { parseAuthParamsFromUrl } from "@/utils/authHelpers";
import { supabase } from "@/integrations/supabase/client";

const InviteSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for invite tokens in URL
    const { accessToken, type } = parseAuthParamsFromUrl();
    
    if (accessToken && type === 'invite') {
      setInviteToken(accessToken);
      
      // Try to extract email from URL params
      const emailParam = searchParams.get('email');
      if (emailParam) {
        setEmail(emailParam);
      }
    } else {
      // If no valid invite token, redirect to signup
      navigate("/signup");
    }

    // If user is already logged in, redirect to dashboard
    if (user?.id) {
      navigate("/dashboard");
    }
  }, [user?.id, navigate, searchParams]);

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!password || !fullName) {
      setError("Şifre ve ad soyad gereklidir.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      setLoading(false);
      return;
    }
    
    try {
      // Verify the invite token and set up the password
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: inviteToken!,
        type: 'invite'
      });

      if (error) {
        throw error;
      }

      // Update the user's password and profile
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: {
          full_name: fullName.trim()
        }
      });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Hesap Kuruldu",
        description: "Şifreniz başarıyla oluşturuldu. Dashboard'a yönlendiriliyorsunuz.",
      });

      navigate("/dashboard");

    } catch (error: any) {
      console.error("Invite setup error:", error);
      const msg = String(error?.message || "");
      let errorMessage = "Şifre kurulumu sırasında bir hata oluştu.";

      if (msg.includes('Token has expired')) {
        errorMessage = "Davet bağlantısının süresi dolmuş. Yeni bir davet isteyin.";
      } else if (msg.includes('Invalid token')) {
        errorMessage = "Geçersiz davet bağlantısı.";
      } else if (msg) {
        errorMessage = msg;
      }

      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Kurulum Hatası",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Ana sayfa ikonu - Sol üst */}
      <button 
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 z-50 p-3 bg-white rounded-full shadow-lg hover:shadow-xl border border-gray-200 hover:border-primary/20 transition-all duration-200 hover:scale-105 group"
      >
        <Home className="h-6 w-6 text-gray-600 group-hover:text-primary transition-colors" />
      </button>

      {/* Merkez form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo ve başlık */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <button 
                onClick={() => navigate("/")}
                className="hover:scale-105 transition-transform duration-200"
              >
                <img 
                  src="/logo.svg" 
                  alt="PAFTA Logo" 
                  className="h-16 w-auto cursor-pointer"
                />
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Hesabınızı Tamamlayın
            </h1>
            <p className="text-lg text-gray-600">
              Davet kabul edildi! Şimdi şifrenizi belirleyin ve hesabınızı aktifleştirin.
            </p>
          </div>

          {/* Davet formu */}
          <form onSubmit={handlePasswordSetup} className="space-y-6">
            <div className="space-y-4">
              {/* Email (sadece gösterim) */}
              {email && (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    className="h-12 pl-10 text-base border-gray-300 bg-gray-50"
                    disabled
                  />
                  <span className="text-xs text-gray-500 mt-1 block">
                    Davet edilen e-posta adresi
                  </span>
                </div>
              )}

              {/* Ad Soyad */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Ad Soyad"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 pl-10 text-base border-gray-300 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              
              {/* Şifre */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Şifre (en az 6 karakter)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-10 pr-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {/* Hata gösterimi */}
            <ErrorDisplay error={error} />
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={!password || !fullName || loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Hesap Kuruluyor...
                </div>
              ) : (
                "Hesabımı Oluştur"
              )}
            </Button>
          </form>

          {/* Güvenlik bilgisi */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Güvenlik:</strong> Bu özel davet linki size özeldir ve sadece bir kez kullanılabilir. 
              Şifrenizi güçlü tutun.
            </p>
          </div>

          {/* Giriş yap linki */}
          <div className="text-center">
            <p className="text-gray-600">
              Zaten bir hesabınız var mı?{" "}
              <button 
                onClick={() => navigate("/signin")}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Giriş Yapın
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteSetup;