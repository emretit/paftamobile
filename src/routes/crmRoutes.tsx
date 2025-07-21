
import Tasks from "@/pages/Tasks";
import Opportunities from "@/pages/crm/Opportunities";
import CrmDashboard from "@/pages/crm/CrmDashboard";
import PurchaseManagement from "@/pages/PurchaseManagement";
import { RouteConfig } from "./types";

// Define CRM and workflow routes
export const crmRoutes: RouteConfig[] = [
  { path: "/tasks", component: Tasks, protected: true },
  { path: "/opportunities", component: Opportunities, protected: true },
  { path: "/crm", component: CrmDashboard, protected: true },
  { path: "/purchase-management", component: PurchaseManagement, protected: true },
];
