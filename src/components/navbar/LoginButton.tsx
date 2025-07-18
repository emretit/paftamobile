
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const LoginButton = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleClick = () => {
    if (user) {
      // User is logged in, go to dashboard
      navigate("/orders/purchase");
    } else {
      // User is not logged in, go to auth page
      navigate("/auth");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">
          Merhaba, {user.email}
        </span>
        <Button variant="outline" onClick={() => navigate("/orders/purchase")}>
          Dashboard
        </Button>
        <Button variant="outline" onClick={handleLogout}>
          Çıkış
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleClick}>
      Giriş Yap
    </Button>
  );
};

export default LoginButton;
