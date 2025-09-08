
import Service from "@/pages/Service";
import ServiceList from "@/pages/ServiceList";
import { RouteConfig } from "./types";

// Define service routes
export const serviceRoutes: RouteConfig[] = [
  { path: "/service", component: Service, protected: true },
  { path: "/service/list", component: ServiceList, protected: true },
];
