
import Settings from "@/pages/Settings";
import TemplateEditor from "@/pages/TemplateEditor";
import TestPDFMe from "@/pages/TestPDFMe";
import { RouteConfig } from "./types";

// Define settings routes
export const settingsRoutes: RouteConfig[] = [
  { path: "/settings", component: Settings, protected: true },
];

// Define template routes
export const templateRoutes: RouteConfig[] = [
  { path: "/templates/editor", component: TemplateEditor, protected: true },
  { path: "/templates/test", component: TestPDFMe, protected: true },
];
