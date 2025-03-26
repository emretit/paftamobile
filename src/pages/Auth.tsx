
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

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
  const [view, setView] = useState<"signin" | "signup" | "forgotten_password">("signin");
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/crm"); // Always redirect to the dashboard
      }
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          navigate("/crm"); // Always redirect to the dashboard
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
          <ErrorDisplay error={error} />

          {view === "forgotten_password" ? (
            resetPasswordSuccess ? (
              <ResetSuccess onBackToSignIn={handleBackToSignIn} />
            ) : (
              <PasswordResetForm 
                onSuccess={handleResetSuccess} 
                onBackToSignIn={handleBackToSignIn}
                onError={setError}
              />
            )
          ) : (
            <Tabs 
              defaultValue={view} 
              value={view} 
              onValueChange={(v) => {
                setView(v as any);
                setError(null);
              }} 
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Giriş</TabsTrigger>
                <TabsTrigger value="signup">Kayıt</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <SignInForm 
                  onViewChange={handleViewChange}
                  onError={setError}
                />
              </TabsContent>

              <TabsContent value="signup">
                <SignUpForm 
                  onSignUpSuccess={handleSignUpSuccess}
                  onError={setError}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
