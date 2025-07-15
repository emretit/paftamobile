
import Cashflow from "@/pages/Cashflow";
import PurchaseInvoices from "@/pages/PurchaseInvoices";
import SalesInvoices from "@/pages/SalesInvoices";
import { RouteConfig } from "./types";

// Define cashflow routes
export const cashflowRoutes: RouteConfig[] = [
  { path: "/cashflow", component: Cashflow, protected: true },
  { path: "/cashflow/add-transaction", component: Cashflow, protected: true },
  { path: "/cashflow/transactions", component: Cashflow, protected: true },
  { path: "/cashflow/categories", component: Cashflow, protected: true },
];

// Define finance routes (keeping existing purchase/sales invoice routes)
export const financeRoutes: RouteConfig[] = [
  { path: "/purchase-invoices", component: PurchaseInvoices, protected: true },
  { path: "/sales-invoices", component: SalesInvoices, protected: true },
];
