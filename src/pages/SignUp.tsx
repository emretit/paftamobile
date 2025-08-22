import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ErrorDisplay } from "@/components/auth/ErrorDisplay";
import { ArrowRight, Mail, Lock, User, Building, Eye, EyeOff } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const sessionToken = localStorage.getItem('session_token');
    const user = localStorage.getItem('user');
    
    if (sessionToken && user) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!companyName.trim()) {
      setError("Şirket adı gereklidir.");
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen şirket adını giriniz.",
      });
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/register-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          full_name: name, 
          company_name: companyName 
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data?.error || 'Kayıt hatası');
        toast({
          variant: "destructive",
          title: "Kayıt Hatası",
          description: data?.error || 'Kayıt hatası',
        });
      } else {
        if (data.requiresConfirmation) {
          setEmailSent(true);
          toast({
            title: "Kayıt Başarılı",
            description: "Email adresinizi kontrol ederek hesabınızı onaylayın.",
          });
        } else {
          toast({
            title: "Kayıt Başarılı",
            description: "Hesabınız oluşturuldu, giriş yapabilirsiniz.",
          });
          navigate("/signin");
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Beklenmeyen bir hata oluştu.");
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu.",
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
              <img 
                src="/logo.svg" 
                alt="PAFTA Logo" 
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              PAFTA'a Hoş Geldiniz
            </h1>
            <p className="text-lg text-gray-600">
              Hemen kullanmaya başlayın - ücretsizdir. Kredi kartı gerekmez.
            </p>
          </div>

          {/* Kayıt formu */}
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Adınız Soyadınız"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 pl-10 text-base border-gray-300 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Şirket Adı"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-12 pl-10 text-base border-gray-300 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              
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
                  placeholder="Şifre"
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
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={!name || !companyName || !email || !password || loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Hesap Oluşturuluyor...
                </div>
              ) : (
                <div className="flex items-center">
                  Hesap Oluştur
                  <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Şartlar */}
          <p className="text-sm text-gray-500 text-center">
            Devam ederek, aşağıdaki hususları kabul etmiş olursunuz:{" "}
            <a href="#" className="text-primary hover:text-primary/80 font-medium">Hizmet Şartları</a>{" "}
            ve{" "}
            <a href="#" className="text-primary hover:text-primary/80 font-medium">Gizlilik Politikası</a>
          </p>

          {/* Email onay mesajı */}
          {emailSent && (
            <div className="text-sm text-primary bg-primary/10 p-4 rounded-lg text-center border border-primary/20">
              <div className="font-medium mb-1">Onay E-postası Gönderildi</div>
              Lütfen e-posta kutunuzu kontrol edin ve hesabınızı onaylayın.
            </div>
          )}

          {/* Hata gösterimi */}
          <ErrorDisplay error={error} />

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

export default SignUp;
