
import React from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

// Temporarily modified to always allow access
const AuthGuard = ({ children }: AuthGuardProps) => {
  // Simply return the children without any authentication check
  return <>{children}</>;
};

export default AuthGuard;
