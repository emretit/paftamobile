
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Mail, AlertTriangle } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<"signin" | "signup" | "forgotten_password">("signin");
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for password reset token or errors in URL
  useEffect(() => {
    const handlePasswordReset = async () => {
      // Check for error parameters in the URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const type = hashParams.get("type");
      const errorCode = hashParams.get("error_code");
      const errorDescription = hashParams.get("error_description");
      
      // Clear the URL without reloading the page
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (errorCode) {
        // Handle various error codes
        setError(errorDescription || "Şifre sıfırlama bağlantısında bir sorun oluştu.");
        setView("forgotten_password");
        toast({
          variant: "destructive",
          title: "Hata",
          description: errorDescription || "Şifre sıfırlama bağlantısında bir sorun oluştu.",
          duration: 5000,
        });
        return;
      }
      
      if (type === "recovery" && accessToken) {
        setLoading(true);
        
        try {
          // Set up new password view
          setView("signin");
          toast({
            title: "Şifre Sıfırlama",
            description: "Şifre sıfırlama işlemi başarılı! Lütfen yeni şifrenizle giriş yapın.",
            duration: 5000,
          });
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Hata",
            description: error.message || "Şifre sıfırlama işlemi başarısız.",
            duration: 5000,
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    handlePasswordReset();
  }, [location, toast]);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          navigate("/");
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      setError(error.message);
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
      setView("signin");
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname,
    });

    if (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    } else {
      setResetPasswordSuccess(true);
      toast({
        title: "E-posta Gönderildi",
        description: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
      });
    }
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">İK Yönetim Sistemi</CardTitle>
          <CardDescription>
            {view === "forgotten_password" 
              ? "Şifrenizi sıfırlamak için e-posta adresinizi girin" 
              : "Devam etmek için giriş yapın veya hesap oluşturun"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">{error}</div>
            </div>
          )}

          {view === "forgotten_password" ? (
            <>
              {resetPasswordSuccess ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 text-green-800 rounded-md">
                    Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.
                  </div>
                  <Button 
                    type="button" 
                    className="w-full" 
                    onClick={() => {
                      setView("signin");
                      setResetPasswordSuccess(false);
                      setError(null);
                    }}
                  >
                    Giriş Sayfasına Dön
                  </Button>
                </div>
              ) : (
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
                      onClick={() => {
                        setView("signin");
                        setError(null);
                      }} 
                      className="w-full"
                    >
                      Geri Dön
                    </Button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <Tabs defaultValue={view} value={view} onValueChange={(v) => {
              setView(v as any);
              setError(null);
            }} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Giriş</TabsTrigger>
                <TabsTrigger value="signup">Kayıt</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="E-posta"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setView("forgotten_password");
                          setError(null);
                        }}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Şifremi Unuttum
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
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
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
