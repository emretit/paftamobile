
import Settings from "@/pages/Settings";
import { TemplateDesignerPage } from "@/pages/TemplateDesignerPage";
import { RouteConfig } from "./types";

// Define settings routes
export const settingsRoutes: RouteConfig[] = [
  { path: "/settings", component: Settings, protected: true },
  { path: "/settings/templates/new", component: TemplateDesignerPage, protected: true },
  { path: "/settings/templates/:id/edit", component: TemplateDesignerPage, protected: true },
];
