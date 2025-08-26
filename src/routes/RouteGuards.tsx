import React from "react";
import { useAuth } from "@/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import OrgSwitcher from "@/components/OrgSwitcher";

type RouteGuardProps = {
  children: React.ReactNode;
};

export const PublicRoute: React.FC<RouteGuardProps> = ({ children }) => children;

// Protected routes require authentication
export const ProtectedRoute: React.FC<RouteGuardProps> = ({ children }) => {
  const { userId, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !userId) {
      navigate("/auth");
    }
  }, [userId, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with OrgSwitcher */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">NGS Business Management</h1>
          <OrgSwitcher />
        </div>
      </header>
      
      {/* Main content */}
      {children}
    </div>
  );
};
