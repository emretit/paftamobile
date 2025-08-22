import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ErrorDisplay } from "@/components/auth/ErrorDisplay";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Kullanıcıyı veritabanında ara
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email)
        .maybeSingle();

      if (userError) {
        console.error('Database error:', userError);
        setError('Veritabanı hatası');
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Veritabanı hatası",
        });
        return;
      }

      if (!user) {
        setError('Geçersiz email veya şifre');
        toast({
          variant: "destructive",
          title: "Giriş Hatası",
          description: "Geçersiz email veya şifre",
        });
        return;
      }

      // Şifre kontrolü (düz metin - geçici)
      if (password !== user.password_hash) {
        setError('Geçersiz email veya şifre');
        toast({
          variant: "destructive",
          title: "Giriş Hatası",
          description: "Geçersiz email veya şifre",
        });
        return;
      }

      // Hesap aktif mi kontrol et
      if (!user.is_active) {
        setError('Hesabınızı onaylamanız gerekiyor');
        toast({
          variant: "destructive",
          title: "Hesap Onayı",
          description: "Hesabınızı onaylamanız gerekiyor",
        });
        return;
      }

      // Session token oluştur
      const sessionToken = crypto.randomUUID();

      // Son giriş zamanını güncelle
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Kullanıcının projelerini getir
      const { data: userProjects } = await supabase
        .from('user_projects')
        .select('project_id')
        .eq('user_id', user.id);

      const projectIds = userProjects?.map((p: any) => p.project_id) ?? [];
      const defaultProjectId = projectIds[0] ?? null;

      // Session token ve kullanıcı bilgilerini kaydet
      localStorage.setItem('session_token', sessionToken);
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }));
      
      if (projectIds.length > 0) {
        localStorage.setItem('project_ids', JSON.stringify(projectIds));
      }
      
      if (defaultProjectId) {
        localStorage.setItem('default_project_id', defaultProjectId);
      }
      
      toast({
        title: "Başarılı",
        description: "Giriş yapıldı",
      });
      
      if (defaultProjectId) {
        navigate(`/dashboard?project=${defaultProjectId}`);
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error('Login error:', err);
      setError('Beklenmeyen bir hata oluştu');
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
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

          {/* Ana sayfa tuşu */}
          <div className="text-center">
            <button 
              onClick={() => navigate("/")}
              className="inline-flex items-center px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Ana Sayfaya Dön
            </button>
          </div>

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
