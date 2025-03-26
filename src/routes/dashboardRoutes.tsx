
import Dashboard from "@/pages/Dashboard";
import { RouteConfig } from "./types";

// Define dashboard routes
export const dashboardRoutes: RouteConfig[] = [
  { path: "/dashboard", component: Dashboard, protected: true },
];
