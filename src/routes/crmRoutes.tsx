
import Proposals from "@/pages/Proposals";
import ProposalCreate from "@/pages/ProposalCreate";
import ProposalDetail from "@/pages/ProposalDetail";
import ProposalEdit from "@/pages/ProposalEdit";
import Tasks from "@/pages/Tasks";
import Opportunities from "@/pages/crm/Opportunities";
import CrmDashboard from "@/pages/crm/CrmDashboard";
import PurchaseManagement from "@/pages/PurchaseManagement";
import { RouteConfig } from "./types";

// Define CRM and workflow routes
export const crmRoutes: RouteConfig[] = [
  { path: "/proposals", component: Proposals, protected: true },
  { path: "/proposal/create", component: ProposalCreate, protected: true },
  { path: "/proposal/:id", component: ProposalDetail, protected: true },
  { path: "/proposal/:id/edit", component: ProposalEdit, protected: true },
  { path: "/tasks", component: Tasks, protected: true },
  { path: "/opportunities", component: Opportunities, protected: true },
  { path: "/crm", component: CrmDashboard, protected: true },
  { path: "/purchase-management", component: PurchaseManagement, protected: true },
];
