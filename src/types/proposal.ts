export type ProposalStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'sent' 
  | 'accepted' 
  | 'rejected' 
  | 'expired';

export const proposalStatusLabels: Record<ProposalStatus, string> = {
  draft: "Taslak",
  pending_approval: "Onay Bekliyor",
  sent: "Gönderildi",
  accepted: "Kabul Edildi",
  rejected: "Reddedildi",
  expired: "Süresi Dolmuş"
};

export const proposalStatusColors: Record<ProposalStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending_approval: "bg-amber-100 text-amber-800",
  sent: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-orange-100 text-orange-800"
};

export interface ProposalItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  total_price: number;
  discount_rate?: number;
  currency?: string;
  product_id?: string;
  stock_status?: string;
}

export interface Customer {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
}

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  avatar_url?: string;
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
  
  total_value?: number;
  proposal_number?: number | string;
  payment_terms?: string;
  delivery_terms?: string;
  internal_notes?: string;
  discounts?: number;
  additional_charges?: number;
  
  customer?: Customer;
  employee?: Employee;
  customer_name?: string;
  employee_name?: string;
}

export interface ProposalFilters {
  status: string;
  search: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}
