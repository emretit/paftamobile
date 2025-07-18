import { RouteConfig } from "./types";
import { lazy } from "react";

const PurchaseManagement = lazy(() => import("@/pages/PurchaseManagement"));
const ProductMapping = lazy(() => import("@/pages/ProductMapping"));

export const purchaseRoutes: RouteConfig[] = [
  {
    path: "/purchase-management",
    element: <PurchaseManagement />,
    isProtected: true,
  },
  {
    path: "/product-mapping/:invoiceId",
    element: <ProductMapping />,
    isProtected: true,
  },
]; 