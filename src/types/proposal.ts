
export type ProposalStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'discovery_scheduled' 
  | 'meeting_completed' 
  | 'quote_in_progress' 
  | 'quote_sent' 
  | 'negotiation' 
  | 'approved' 
  | 'rejected' 
  | 'converted_to_order';

export interface ProposalItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  total_price: number;
}

export interface Proposal {
  id: string;
  number: string;
  title: string;
  description?: string;
  customer_id?: string;
  opportunity_id?: string;
  employee_id?: string;
  status: ProposalStatus;
  total_amount: number;
  created_at: string;
  updated_at: string;
  valid_until?: string;
  items?: ProposalItem[];
  attachments?: any[];
  currency?: string;
  terms?: string;
  notes?: string;
  customer_name?: string;
  employee_name?: string;
}
