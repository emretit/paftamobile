
import Proposals from "@/pages/Proposals";
import ProposalCreate from "@/pages/ProposalCreate";
import ProposalCreateSinglePage from "@/pages/ProposalCreateSinglePage";
import ProposalEdit from "@/pages/ProposalEdit";
import { RouteConfig } from "./types";

// Define proposal routes
export const proposalRoutes: RouteConfig[] = [
  { path: "/proposals", component: Proposals, protected: true },
  { path: "/proposal/create", component: ProposalCreateSinglePage, protected: true },
  { path: "/proposal/:id", component: ProposalEdit, protected: true },
  { path: "/proposal/:id/edit", component: ProposalEdit, protected: true },
];
