
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LoginButton = () => {
  return (
    <Link to="/auth">
      <Button variant="outline" size="sm">
        Giriş Yap
      </Button>
    </Link>
  );
};

export default LoginButton;
