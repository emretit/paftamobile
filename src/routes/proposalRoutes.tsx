
import Proposals from "@/pages/Proposals";
import ProposalCreate from "@/pages/ProposalCreate";
import ProposalDetail from "@/pages/ProposalDetail";
import ProposalEdit from "@/pages/ProposalEdit";
import { RouteConfig } from "./types";

// Define proposal routes
export const proposalRoutes: RouteConfig[] = [
  { path: "/proposals", component: Proposals, protected: true },
  { path: "/proposal/create", component: ProposalCreate, protected: true },
  { path: "/proposal/:id", component: ProposalDetail, protected: true },
  { path: "/proposal/:id/edit", component: ProposalEdit, protected: true },
];
