import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const LoginButton = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

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

  const handleClick = () => {
    if (isLoggedIn) {
      navigate("/crm"); // Always navigate to dashboard if logged in
    } else {
      navigate("/auth"); // Navigate to auth if not logged in
    }
  };

  return (
    <Button onClick={handleClick}>
      {isLoggedIn ? "Dashboard'a Git" : "Giriş Yap"}
    </Button>
  );
};

export default LoginButton;
