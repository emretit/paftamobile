import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn, signUp, resetPassword, resendConfirmation, loading: authLoading } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isResetPassword) {
        const { error } = await resetPassword(formData.email);
        if (error) {
          toast({
            variant: 'destructive',
            title: 'Hata',
            description: error.message,
          });
        } else {
          toast({
            title: 'Başarılı',
            description: 'Şifre sıfırlama e-postası gönderildi.',
          });
          setIsResetPassword(false);
        }
      } else if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          const msg = (error?.message || '').toLowerCase();
          if (msg.includes('error sending confirmation email') || msg.includes('unexpected_failure') || msg.includes('535') || msg.includes('450')) {
            try {
              const { error: resendErr } = await resendConfirmation(formData.email);
              if (!resendErr) {
                toast({ title: 'Hesap oluşturuldu', description: 'Onay e-postası yeniden gönderildi. Lütfen e-posta kutunuzu kontrol edin.' });
                return;
              }
            } catch {}
          }
          toast({ variant: 'destructive', title: 'Kayıt Hatası', description: error.message });
        } else {
          toast({ title: 'Hesap oluşturuldu', description: 'Onay e-postası gönderildi. Lütfen e-posta kutunuzu kontrol edin.' });
          return;
        }

      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            variant: 'destructive',
            title: 'Giriş Hatası',
            description: error.message,
          });
        } else {
          toast({
            title: 'Başarılı',
            description: 'Giriş yapıldı.',
          });
          // Redirect to intended page or dashboard
          const from = location.state?.from?.pathname || '/dashboard';
          navigate(from, { replace: true });
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Beklenmeyen bir hata oluştu.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/logo.svg" alt="PAFTA Logo" className="h-12 w-auto" />
          </div>
          <CardTitle>
            {isResetPassword 
              ? 'Şifre Sıfırlama' 
              : isSignUp 
                ? 'Hesap Oluştur' 
                : 'Giriş Yap'
            }
          </CardTitle>
          <CardDescription>
            {isResetPassword 
              ? 'E-posta adresinizi girin' 
              : isSignUp 
                ? 'PAFTA\'ya hoş geldiniz' 
                : 'Hesabınıza giriş yapın'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ad Soyad"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="E-posta"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
                required
              />
            </div>

            {!isResetPassword && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifre"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  İşleniyor...
                </div>
              ) : (
                isResetPassword 
                  ? 'Şifre Sıfırla' 
                  : isSignUp 
                    ? 'Hesap Oluştur' 
                    : 'Giriş Yap'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {!isResetPassword ? (
              <>
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? 'Zaten hesabınız var mı?' : 'Hesabınız yok mu?'}{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary hover:underline"
                  >
                    {isSignUp ? 'Giriş Yap' : 'Hesap Oluştur'}
                  </button>
                </p>
                
                {!isSignUp && (
                  <p className="text-sm text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => setIsResetPassword(true)}
                      className="text-primary hover:underline"
                    >
                      Şifrenizi mi unuttunuz?
                    </button>
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setIsResetPassword(false)}
                  className="text-primary hover:underline"
                >
                  Giriş sayfasına dön
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;