
import { ProposalItem } from "./proposal-form";

export interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  items: ProposalItem[];
  prefilledFields?: {
    title?: string;
    paymentTerm?: string;
    validityDays?: number;
    internalNotes?: string;
  };
}
