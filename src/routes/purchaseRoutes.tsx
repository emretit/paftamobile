import { RouteConfig } from "./types";
import { lazy } from "react";

const PurchaseManagement = lazy(() => import("@/pages/PurchaseManagement"));
const ProductMapping = lazy(() => import("@/pages/ProductMapping"));

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
];