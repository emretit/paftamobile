
import { ProposalItem } from "./proposal";

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
}
