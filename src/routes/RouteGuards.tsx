
import React from "react";
import AuthGuard from "@/components/AuthGuard";

type RouteGuardProps = {
  children: React.ReactNode;
};

export const PublicRoute: React.FC<RouteGuardProps> = ({ children }) => children;

// Temporarily modified to not require authentication
export const ProtectedRoute: React.FC<RouteGuardProps> = ({ children }) => (
  // Temporarily bypassing AuthGuard
  <>{children}</>
  // Will be restored later: <AuthGuard>{children}</AuthGuard>
);
