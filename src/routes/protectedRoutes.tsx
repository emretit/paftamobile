import { lazy } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { RouteConfig } from "./types";

// Lazy load dashboard and other protected pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const AddEmployee = lazy(() => import("@/pages/AddEmployee"));

// Wrap all protected routes with ProtectedRoute component
const withProtectedRoute = (Component: React.ComponentType) => {
  return () => (
    <ProtectedRoute>
      <Component />
    </ProtectedRoute>
  );
};

// Define protected routes
export const protectedRoutes: RouteConfig[] = [
  { path: "/dashboard", component: withProtectedRoute(Dashboard), protected: true },
  { path: "/add-employee", component: withProtectedRoute(AddEmployee), protected: true },
];