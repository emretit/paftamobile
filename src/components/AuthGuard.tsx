
import React from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

// Authentication completely disabled
const AuthGuard = ({ children }: AuthGuardProps) => {
  // No authentication checks - always allow access
  return <>{children}</>;
};

export default AuthGuard;
