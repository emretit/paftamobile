
import Settings from "@/pages/Settings";
import { RouteConfig } from "./types";

// Define settings routes
export const settingsRoutes: RouteConfig[] = [
  { path: "/settings", component: Settings, protected: true },
];

// Template routes removed - now integrated in TemplateManagement
export const templateRoutes: RouteConfig[] = [];
