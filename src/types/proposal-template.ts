
import { ProposalItem } from "./proposal";

export interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  templateType: string;
  templateFeatures: string[];
  items: ProposalItem[];
  prefilledFields?: {
    title?: string;
    validityDays?: number;
    paymentTerm?: string;
    internalNotes?: string;
  };
}
