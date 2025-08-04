
import Proposals from "@/pages/Proposals";
import NewProposalCreate from "@/pages/NewProposalCreate";
import ProposalEdit from "@/pages/ProposalEdit";
import TemplateSelection from "@/pages/TemplateSelection";
import StandardProposalCreate from "@/pages/StandardProposalCreate";
import { RouteConfig } from "./types";

// Define proposal routes
export const proposalRoutes: RouteConfig[] = [
  { path: "/proposals", component: Proposals, protected: true },
  { path: "/proposals/templates", component: TemplateSelection, protected: true },
  { path: "/proposals/create", component: NewProposalCreate, protected: true },
  { path: "/proposals/create/standard", component: StandardProposalCreate, protected: true },
  { path: "/proposal/create", component: NewProposalCreate, protected: true },
  { path: "/proposal/:id", component: ProposalEdit, protected: true },
  { path: "/proposal/:id/edit", component: ProposalEdit, protected: true },
];
