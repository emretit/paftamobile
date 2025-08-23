
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { clearAuthTokens } from "@/lib/supabase-utils";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

const LoginButton = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check current session from localStorage
    const sessionToken = localStorage.getItem('session_token');
    const userData = localStorage.getItem('user');
    
    if (sessionToken && userData) {
      try {
        const user = JSON.parse(userData);
        setUser(user);
      } catch (error) {
        console.error('User data parse error:', error);
        clearAuthTokens();
      }
    }
  }, []);

  const handleClick = () => {
    if (user) {
      // User is logged in, go to dashboard
      navigate("/dashboard");
    } else {
      // User is not logged in, go to signin page
      navigate("/signin");
    }
  };

  const handleLogout = async () => {
    clearAuthTokens();
    setUser(null);
    window.location.replace("/signin");
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">
          Merhaba, {user.full_name || user.email}
        </span>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
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
