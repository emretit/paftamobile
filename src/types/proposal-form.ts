
import { ProposalItem, ProposalStatus } from "./proposal";

export interface ProposalFormData {
  title: string;
  customer_id?: string;
  employee_id?: string;
  opportunity_id?: string;
  items?: ProposalItem[];
  valid_until?: string;
  payment_terms?: string;
  delivery_terms?: string;
  notes?: string;
  internalNotes?: string;
  paymentTerm?: string;
  discounts?: number;
  additionalCharges?: number;
  total_amount?: number;
  description?: string;
  status: ProposalStatus; // Changed from optional to required
}

// Export the ProposalItem type (using export type for isolatedModules)
export type { ProposalItem } from "./proposal";

// Adding the PaymentTerm type that's missing
export type PaymentTerm = "prepaid" | "net15" | "net30" | "net60" | "custom";
