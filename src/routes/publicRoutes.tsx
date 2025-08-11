
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import About from "@/pages/About";
import Profile from "@/pages/Profile";
import { RouteConfig } from "./types";

// Define public routes
export const publicRoutes: RouteConfig[] = [
  { path: "/", component: Index, protected: false },
  { path: "/auth", component: Auth, protected: false },
  { path: "/about", component: About, protected: false },
  { path: "/profile", component: Profile, protected: true }, // Profile needs auth
];
