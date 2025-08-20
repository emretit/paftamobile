import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

          {/* Email girişi */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="E-posta adresiniz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>
            
            <Button 
              onClick={handleContinueWithEmail}
              disabled={!email || loading}
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? "Devam ediliyor..." : "Devam et"}
            </Button>
          </div>

          {/* Şartlar */}
          <p className="text-sm text-gray-500 text-center">
            Devam ederek, aşağıdaki hususları kabul etmiş olursunuz:{" "}
            <a href="#" className="text-primary hover:text-primary/80 font-medium">Hizmet Şartları</a>{" "}
            ve{" "}
            <a href="#" className="text-primary hover:text-primary/80 font-medium">Gizlilik Politikası</a>
          </p>

          {/* Giriş yap linki */}
          <div className="text-center">
            <p className="text-gray-600">
              Zaten bir hesabınız var mı?{" "}
              <button 
                onClick={() => setView("signin")}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Giriş Yapın
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

export default Auth;
