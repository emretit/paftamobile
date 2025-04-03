
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LoginButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/dashboard"); // Always navigate to dashboard without checking auth
  };

  return (
    <Button onClick={handleClick}>
      Dashboard'a Git
    </Button>
  );
};

export default LoginButton;
