
import Proposals from "@/pages/Proposals";
import NewProposalCreate from "@/pages/NewProposalCreate";
import ProposalEdit from "@/pages/ProposalEdit";
import ProposalFormWizard from "@/components/proposals/templates/enhanced/ProposalFormWizard";
import { RouteConfig } from "./types";

// Define proposal routes
export const proposalRoutes: RouteConfig[] = [
  { path: "/proposals", component: Proposals, protected: true },
  { path: "/proposals/create", component: NewProposalCreate, protected: true },
  { path: "/proposals/wizard", component: ProposalFormWizard, protected: true },
  { path: "/proposal/create", component: NewProposalCreate, protected: true },
  { path: "/proposal/:id", component: ProposalEdit, protected: true },
  { path: "/proposal/:id/edit", component: ProposalEdit, protected: true },
];
