
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import { RouteConfig } from "./types";

// Define public routes
export const publicRoutes: RouteConfig[] = [
  { path: "/", component: Index, protected: false },
  { path: "/auth", component: Auth, protected: false },
];
