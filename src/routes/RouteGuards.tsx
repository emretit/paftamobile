
import React from "react";
import AuthGuard from "@/components/AuthGuard";

type RouteGuardProps = {
  children: React.ReactNode;
};

export const PublicRoute: React.FC<RouteGuardProps> = ({ children }) => children;

// Authentication disabled - all routes are public
export const ProtectedRoute: React.FC<RouteGuardProps> = ({ children }) => (
  <>{children}</>
);
