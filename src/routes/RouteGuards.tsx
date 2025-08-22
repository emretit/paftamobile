
import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

type RouteGuardProps = {
  children: React.ReactNode;
};

export const PublicRoute: React.FC<RouteGuardProps> = ({ children }) => children;

// Protected routes now require authentication
export const AuthenticatedRoute: React.FC<RouteGuardProps> = ({ children }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);
