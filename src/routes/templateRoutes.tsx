import { RouteConfig } from "./types";
import PdfTemplatesList from "@/pages/templates/PdfTemplatesList";
import PdfTemplateEditor from "@/pages/templates/PdfTemplateEditor";

export const templateRoutes: RouteConfig[] = [
  { path: "/templates", component: PdfTemplatesList, protected: true },
  { path: "/templates/new", component: PdfTemplateEditor, protected: true },
  { path: "/templates/:id", component: PdfTemplateEditor, protected: true },
];