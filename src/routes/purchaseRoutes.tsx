import { RouteConfig } from "./types";
import { lazy } from "react";

const PurchaseManagement = lazy(() => import("@/pages/PurchaseManagement"));
const ProductMapping = lazy(() => import("@/pages/ProductMapping"));
const PurchaseInvoices = lazy(() => import("@/pages/PurchaseInvoices"));
const EInvoices = lazy(() => import("@/pages/EInvoices"));

export const purchaseRoutes: RouteConfig[] = [
  {
    path: "/purchase",
    component: PurchaseManagement,
    protected: true,
  },
  {
    path: "/purchase-management",
    component: PurchaseManagement,
    protected: true,
  },
  {
    path: "/purchase/e-invoice",
    component: EInvoices,
    protected: true,
  },
  {
    path: "/product-mapping/:invoiceId",
    component: ProductMapping,
    protected: true,
  },
];