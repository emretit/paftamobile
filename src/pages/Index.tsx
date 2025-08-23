
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ScreenshotSection from "@/components/landing/ScreenshotSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FaqSection from "@/components/landing/FaqSection";
import CtaSection from "@/components/landing/CtaSection";
import FooterSection from "@/components/landing/FooterSection";
import LoginButton from "@/components/navbar/LoginButton";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Kullanıcı giriş durumunu kontrol et
  useEffect(() => {
    const checkSession = () => {
      try {
        const sessionToken = localStorage.getItem('session_token');
        const userData = localStorage.getItem('user');
        
        if (sessionToken && userData) {
          // Kullanıcı giriş yapmışsa dashboard'a yönlendir
          navigate("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Session kontrol hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  // Loading sırasında boş sayfa göster
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <FeaturesSection />
      <ScreenshotSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <FooterSection />
    </div>
  );
};

export default Index;
