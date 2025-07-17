import EInvoiceManagement from "@/pages/EInvoiceManagement";
import { RouteConfig } from "./types";

// Define e-invoice routes
export const einvoiceRoutes: RouteConfig[] = [
  { path: "/e-invoice", component: EInvoiceManagement, protected: true },
];