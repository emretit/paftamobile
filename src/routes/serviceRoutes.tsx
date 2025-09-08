
import Service from "@/pages/Service";
import ServiceNew from "@/pages/ServiceNew";
import { RouteConfig } from "./types";

// Define service routes
export const serviceRoutes: RouteConfig[] = [
  { path: "/service", component: Service, protected: true },
  { path: "/service/new", component: ServiceNew, protected: true },
];
