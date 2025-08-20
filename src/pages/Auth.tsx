import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Import our new components
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { ResetSuccess } from "@/components/auth/ResetSuccess";
import { ErrorDisplay } from "@/components/auth/ErrorDisplay";
import { parseAuthParamsFromUrl, getAuthErrorMessage } from "@/utils/authHelpers";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"signin" | "signup" | "forgotten_password">("signup");
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  // Check for password reset token or errors in URL
  useEffect(() => {
    const handlePasswordReset = async () => {
      const { accessToken, type, errorCode, errorDescription } = parseAuthParamsFromUrl();
      
      if (errorCode) {
        // Handle error from URL parameters
        const errorMessage = getAuthErrorMessage(errorCode, errorDescription);
        setError(errorMessage);
        setView("forgotten_password");
        toast({
          variant: "destructive",
          title: "Hata",
          description: errorMessage,
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
  }, [toast]);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      // Updated to use the correct method
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard"); // Always redirect to the dashboard
      }
    };
    
    checkSession();
    
    // Updated to use the correct method
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          navigate("/dashboard"); // Always redirect to the dashboard
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleViewChange = (newView: "signup" | "forgotten_password") => {
    setView(newView);
    setError(null);
  };

  const handleSignUpSuccess = () => {
    setView("signin");
  };

  const handleBackToSignIn = () => {
    setView("signin");
    setResetPasswordSuccess(false);
    setError(null);
  };

  const handleResetSuccess = () => {
    setResetPasswordSuccess(true);
  };

  const handleContinueWithEmail = () => {
    if (email) {
      setView("signup");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Google ile giriş yapılamadı.",
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sol taraf - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo ve başlık */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img 
                src="/logo.svg" 
                alt="PAFTA Logo" 
                className="h-12 w-auto"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              PAFTA'a hoş geldiniz
            </h1>
            <p className="text-lg text-gray-600">
              Hemen kullanmaya başlayın - ücretsizdir. Kredi kartı gerekmez.
            </p>
          </div>

          {/* Google ile devam et */}
          <div className="space-y-4">
            <Button 
              onClick={handleGoogleSignIn}
              variant="outline" 
              className="w-full h-12 text-base font-medium border-gray-300 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google ile devam edin
            </Button>

            {/* Ayırıcı */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">VEYA</span>
              </div>
            </div>

            {/* Email girişi */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="isim@şirket.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base"
                />
              </div>
              
              <Button 
                onClick={handleContinueWithEmail}
                disabled={!email || loading}
                className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Devam ediliyor..." : "Devam et"}
              </Button>
            </div>

            {/* Şartlar */}
            <p className="text-sm text-gray-500 text-center">
              Devam ederek, aşağıdaki hususları kabul etmiş olursunuz:{" "}
              <a href="#" className="text-blue-600 hover:underline">Hizmet Şartları</a>{" "}
              ve{" "}
              <a href="#" className="text-blue-600 hover:underline">Gizlilik Politikası</a>
            </p>
          </div>

          {/* Giriş yap linki */}
          <div className="text-center">
            <p className="text-gray-600">
              Zaten bir hesabınız var mı?{" "}
              <button 
                onClick={() => setView("signin")}
                className="text-blue-600 hover:underline font-medium"
              >
                Oturum aç
              </button>
            </p>
          </div>

          {/* Hata gösterimi */}
          <ErrorDisplay error={error} />

          {/* Form içeriği - varsayılan olarak gizli */}
          {view === "signup" && email && (
            <div className="mt-8">
              <SignUpForm 
                onSignUpSuccess={handleSignUpSuccess}
                onError={setError}
                initialEmail={email}
              />
            </div>
          )}

          {view === "signin" && (
            <div className="mt-8">
              <SignInForm 
                onViewChange={handleViewChange}
                onError={setError}
                initialEmail={email}
              />
            </div>
          )}

          {view === "forgotten_password" && (
            <div className="mt-8">
              {resetPasswordSuccess ? (
                <ResetSuccess onBackToSignIn={handleBackToSignIn} />
              ) : (
                <PasswordResetForm 
                  onSuccess={handleResetSuccess} 
                  onBackToSignIn={handleBackToSignIn}
                  onError={setError}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sağ taraf - Görsel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/90"></div>
        
        {/* Ana görsel - CRM/ERP arayüzü */}
        <div className="relative z-10 flex items-center justify-center w-full">
          <div className="bg-white rounded-xl shadow-2xl p-8 transform rotate-3 scale-90">
            <div className="w-80 h-64 bg-gray-50 rounded-lg border border-gray-200 p-4">
              {/* Tablo başlıkları */}
              <div className="flex space-x-2 mb-3">
                <div className="w-16 h-3 bg-blue-200 rounded"></div>
                <div className="w-20 h-3 bg-blue-200 rounded"></div>
                <div className="w-24 h-3 bg-blue-200 rounded"></div>
                <div className="w-16 h-3 bg-blue-200 rounded"></div>
              </div>
              
              {/* Tablo satırları */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-2 mb-2">
                  <div className="w-16 h-2 bg-gray-200 rounded"></div>
                  <div className="w-20 h-2 bg-gray-200 rounded"></div>
                  <div className="w-24 h-2 bg-gray-200 rounded"></div>
                  <div className="w-16 h-2 bg-gray-200 rounded"></div>
                </div>
              ))}
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dekoratif elementler */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 left-16 w-16 h-16 bg-white/10 rounded-full"></div>
        <div className="absolute top-1/2 right-20 w-12 h-12 bg-white/5 rounded-full"></div>
        
        {/* Alt bilgi */}
        <div className="absolute bottom-8 right-8 text-white/60 text-sm">
          Gizlilik - Şartlar
        </div>
      </div>
    </div>
  );
};

export default Auth;
