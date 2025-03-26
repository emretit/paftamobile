
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    
    checkSession();
    
    const { data } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
      }
    );
    
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="mx-auto max-w-7xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">CRM & ERP Çözümünüzle</span>
          <span className="block text-blue-600">İşinizi Daha Verimli Yönetin</span>
        </h1>
        <p className="mt-6 max-w-lg mx-auto text-lg text-gray-600 md:text-xl md:max-w-3xl">
          Tüm iş süreçlerinizi tek bir platformda yönetin ve büyümeye odaklanın.
        </p>
        <div className="mt-10 flex justify-center gap-4 flex-col sm:flex-row">
          {isLoggedIn ? (
            <>
              <Link to="/crm">
                <Button size="lg" className="px-8">
                  Dashboard'a Git
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="outline" size="lg" className="px-8">
                  Ayarlar
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button size="lg" className="px-8">
                  Ücretsiz Dene
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8">
                Demo Talep Et
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
