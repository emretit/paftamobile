// Placeholder for proposal types after DB cleanup
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
  pending_approval: "bg-yellow-100 text-yellow-800",
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
  tax_rate: number;
  total_price: number;
  proposal_id?: string;
}

export interface Proposal {
  id: string;
  title: string;
  customer_id?: string | null;
  opportunity_id?: string | null;
  employee_id?: string | null;
  status: ProposalStatus;
  total_value: number;
  sent_date?: string | null;
  valid_until?: string | null;
  created_at: string;
  updated_at: string;
  proposal_number: number;
  payment_terms?: string;
  delivery_terms?: string;
  notes?: string;
  
  // Joined relations
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
  } | null;
  items?: ProposalItem[];
}

export interface ProposalAttachment {
  id: string;
  name: string;
  size: number;
  uploaded_at: string;
  url: string;
}
