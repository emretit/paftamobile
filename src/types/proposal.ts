
export type ProposalStatus = 
  | 'hazirlaniyor'
  | 'onay_bekliyor'
  | 'gonderildi'
  | 'draft'
  | 'new'
  | 'review'
  | 'sent'
  | 'negotiation'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'discovery_scheduled'
  | 'meeting_completed'
  | 'quote_in_progress'
  | 'quote_sent'
  | 'approved'
  | 'converted_to_order'
  | 'preparing'
  | 'pending';

export interface ProposalItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total_price: number;
  currency?: string;
  product_id?: string;
}

export interface ProposalAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploaded_at: string;
}

export interface Proposal {
  id: string;
  title: string;
  customer_id: string | null;
  supplier_id?: string | null;
  employee_id: string | null;
  deal_id: string | null;
  opportunity_id?: string | null;
  status: ProposalStatus;
  total_value: number;
  sent_date: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
  proposal_number: number;
  customer_segment: string | null;
  payment_term?: string;
  internal_notes?: string;
  discounts?: number;
  additional_charges?: number;
  warranty_terms?: string;
  delivery_terms?: string;
  currency?: string;
  files?: any; // This corresponds to the files JSONB field in Supabase
  customer?: {
    id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
  } | null;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    name?: string;
  } | null;
  items?: ProposalItem[];
  // Map attachments to files for backward compatibility
  get attachments(): ProposalAttachment[] {
    return this.files || [];
  }
}

export interface SalesPerformanceData {
  month: string;
  total_proposals: number;
  accepted_proposals: number;
  total_value: number;
  employee_id: string;
  employee_name: string;
  success_rate: number;
}
