import { RouteConfig } from "./types";
import { lazy } from "react";

const PurchaseManagement = lazy(() => import("@/pages/PurchaseManagement"));
const ProductMapping = lazy(() => import("@/pages/ProductMapping"));
const EInvoiceProductMatching = lazy(() => import("@/pages/EInvoiceProductMatching"));
const InvoiceLineMatching = lazy(() => import("@/pages/InvoiceLineMatching"));

export const purchaseRoutes: RouteConfig[] = [
  {
    path: "/purchase-management",
    component: PurchaseManagement,
    protected: true,
  },
  {
    path: "/product-mapping/:invoiceId",
    component: ProductMapping,
    protected: true,
  },
  {
    path: "/einvoice-product-matching/:invoiceId",
    component: EInvoiceProductMatching,
    protected: true,
  },
  {
    path: "/invoice-line-matching",
    component: InvoiceLineMatching,
    protected: true,
  },
];