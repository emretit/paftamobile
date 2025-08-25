import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ErrorDisplay } from "@/components/auth/ErrorDisplay";
import { ArrowRight, Mail, Lock, Eye, EyeOff, Home } from "lucide-react";
import { supabase, setCurrentUserId } from "@/integrations/supabase/client";

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const sessionToken = localStorage.getItem('session_token');
    const user = localStorage.getItem('user');
    
    if (sessionToken && user) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Check for email confirmation token and handle account activation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const confirmed = urlParams.get('confirmed');
    
    if (token) {
      // Token varsa confirm-email edge function'ını çağır
      handleEmailConfirmation(token);
    } else if (confirmed === 'true') {
      toast({
        title: "Hesap Onaylandı! 🎉",
        description: "Hesabınız başarıyla onaylandı. Artık giriş yapabilirsiniz.",
        variant: "default",
      });
      
      // URL'den parametreyi temizle
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const handleEmailConfirmation = async (token: string) => {
    try {
      const response = await supabase.functions.invoke('confirm-email', {
        body: { token }
      });

      if (response.data?.success) {
        toast({
          title: "Hesap Onaylandı! 🎉",
          description: "Hesabınız başarıyla onaylandı. Artık giriş yapabilirsiniz.",
          variant: "default",
        });
      } else {
        toast({
          title: "Onay Hatası",
          description: response.data?.error || "Hesap onaylanırken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Email onay hatası:', error);
      toast({
        title: "Onay Hatası",
        description: "Hesap onaylanırken bir hata oluştu.",
        variant: "destructive",
      });
    }
    
    // URL'den token parametresini temizle
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Lütfen email ve şifre alanlarını doldurun.");
      setLoading(false);
      return;
    }

    try {
      // Custom login edge function'ını kullan
      const { data, error } = await supabase.functions.invoke('custom-login', {
        body: {
          email: email.toLowerCase().trim(),
          password: password
        }
      });

      if (error) {
        console.error("Login function error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        
        // Eğer error.context varsa onu da göster
        let errorMessage = "Giriş sırasında bir hata oluştu";
        if (error.context?.body) {
          try {
            const errorBody = JSON.parse(error.context.body);
            errorMessage = errorBody.error || errorMessage;
          } catch (e) {
            console.log("Could not parse error body:", error.context.body);
          }
        }
        
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Hata",
          description: errorMessage,
        });
        setLoading(false);
        return;
      }

      if (!data.success) {
        setError(data.error || "Geçersiz email veya şifre.");
        toast({
          variant: "destructive",
          title: "Giriş Hatası",
          description: data.error || "Geçersiz email veya şifre.",
        });
        setLoading(false);
        return;
      }

      // Başarılı giriş - verileri localStorage'a kaydet
      localStorage.setItem("session_token", data.session_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // User ID'yi set et (RLS için gerekli)
      setCurrentUserId(data.user.id);

      toast({
        title: "Başarılı",
        description: "Giriş yapıldı. Dashboard'a yönlendiriliyorsunuz...",
      });

      // Dashboard'a yönlendir
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error: any) {
      console.error("Giriş hatası:", error);
      setError("Giriş sırasında bir hata oluştu: " + error.message);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Giriş sırasında bir hata oluştu: " + error.message,
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

      {/* Sol taraf - Form */}
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
              Hesabınıza Giriş Yapın
            </h1>
            <p className="text-lg text-gray-600">
              PAFTA platformuna hoş geldiniz
            </p>
          </div>

          {/* Giriş formu */}
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="E-posta adresiniz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-10 text-base border-gray-300 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Şifreniz"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-10 pr-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
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
            
            <Button 
              type="submit"
              disabled={!email || !password || loading}
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Giriş Yapılıyor...
                </div>
              ) : (
                <div className="flex items-center">
                  Giriş Yap
                  <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Hata gösterimi */}
          <ErrorDisplay error={error} />



          {/* Alt linkler */}
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Henüz bir hesabınız yok mu?{" "}
              <button 
                onClick={() => navigate("/signup")}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Hemen Kaydolun
              </button>
            </p>
            
            <p className="text-gray-600">
              Şifrenizi mi unuttunuz?{" "}
              <button 
                onClick={() => navigate("/forgot-password")}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Şifre Sıfırlama
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Sağ taraf - Görsel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Ana görsel - PAFTA Platform arayüzü */}
        <div className="relative z-10 flex items-center justify-center w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 scale-90">
            <div className="w-80 h-64 bg-gray-50 rounded-xl border border-gray-200 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">PAFTA</span>
                </div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              
              {/* Dashboard cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="w-full h-2 bg-blue-200 rounded mb-2"></div>
                  <div className="w-3/4 h-2 bg-blue-300 rounded"></div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="w-full h-2 bg-green-200 rounded mb-2"></div>
                  <div className="w-2/3 h-2 bg-green-300 rounded"></div>
                </div>
              </div>
              
              {/* Table */}
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <div className="w-16 h-2 bg-gray-200 rounded"></div>
                  <div className="w-20 h-2 bg-gray-200 rounded"></div>
                  <div className="w-24 h-2 bg-gray-200 rounded"></div>
                </div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex space-x-2">
                    <div className="w-16 h-1.5 bg-gray-100 rounded"></div>
                    <div className="w-20 h-1.5 bg-gray-100 rounded"></div>
                    <div className="w-24 h-1.5 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dekoratif elementler */}
        <div className="absolute top-10 right-10 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 left-16 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-white/5 rounded-full"></div>
        
        {/* Alt bilgi */}
        <div className="absolute bottom-8 right-8 text-white/80 text-sm font-medium">
          PAFTA İş Yönetim Sistemi
        </div>
      </div>
    </div>
  );
};

export default SignIn;
