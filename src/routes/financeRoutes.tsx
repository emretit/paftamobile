
import Finance from "@/pages/Finance";
import PurchaseInvoices from "@/pages/PurchaseInvoices";
import SalesInvoices from "@/pages/SalesInvoices";
import { RouteConfig } from "./types";

// Define finance routes
export const financeRoutes: RouteConfig[] = [
  { path: "/finance", component: Finance, protected: true },
  { path: "/purchase-invoices", component: PurchaseInvoices, protected: true },
  { path: "/sales-invoices", component: SalesInvoices, protected: true },
];
