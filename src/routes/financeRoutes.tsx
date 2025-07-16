
import Cashflow from "@/pages/Cashflow";
import PurchaseInvoices from "@/pages/PurchaseInvoices";
import SalesInvoices from "@/pages/SalesInvoices";
import { RouteConfig } from "./types";

// Define cashflow routes
export const cashflowRoutes: RouteConfig[] = [
  { path: "/cashflow", component: Cashflow, protected: true },
  
  { path: "/cashflow/opex-entry", component: Cashflow, protected: true },
  { path: "/cashflow/employee-costs", component: Cashflow, protected: true },
  { path: "/cashflow/loans-and-checks", component: Cashflow, protected: true },
  { path: "/cashflow/invoices", component: Cashflow, protected: true },
  
  { path: "/cashflow/main-table", component: Cashflow, protected: true },
];

// Define finance routes (keeping existing purchase/sales invoice routes)
export const financeRoutes: RouteConfig[] = [
  { path: "/purchase-invoices", component: PurchaseInvoices, protected: true },
  { path: "/sales-invoices", component: SalesInvoices, protected: true },
];
