
import Orders from "@/pages/Orders";
import OrdersList from "@/pages/OrdersList";
import { RouteConfig } from "./types";

// Define order routes
export const orderRoutes: RouteConfig[] = [
  { path: "/orders/purchase", component: Orders, protected: true },
  { path: "/orders/list", component: OrdersList, protected: true },
];
