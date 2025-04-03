
import Dashboard from "@/pages/Dashboard";
import { RouteConfig } from "./types";

export const dashboardRoutes: RouteConfig[] = [
  { 
    path: "/dashboard", 
    component: Dashboard, 
    protected: true 
  },
  {
    path: "/crm", 
    component: Dashboard, 
    protected: true 
  }
];
