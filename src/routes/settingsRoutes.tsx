
import Settings from "@/pages/Settings";
import TemplateEditor from "@/pages/TemplateEditor";
import TestPDFMe from "@/pages/TestPDFMe";
import { RouteConfig } from "./types";

// Define settings routes
export const settingsRoutes: RouteConfig[] = [
  { path: "/settings", component: Settings, protected: true },
  { path: "/settings/templates/pdfme", component: TemplateEditor, protected: true },
  { path: "/settings/test-pdfme", component: TestPDFMe, protected: true },
];
