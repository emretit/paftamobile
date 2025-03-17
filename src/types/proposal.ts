
export type ProposalStatus = 
  | 'draft'
  | 'pending_approval'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'discovery_scheduled'
  | 'meeting_completed'
  | 'quote_in_progress' 
  | 'quote_sent'
  | 'negotiation'
  | 'approved'
  | 'converted_to_order';

export const proposalStatusLabels: Record<ProposalStatus, string> = {
  draft: "Taslak",
  pending_approval: "Onay Bekliyor",
  sent: "Gönderildi",
  accepted: "Kabul Edildi",
  rejected: "Reddedildi",
  expired: "Süresi Dolmuş",
  discovery_scheduled: "Keşif Planlandı",
  meeting_completed: "Görüşme Tamamlandı",
  quote_in_progress: "Teklif Hazırlanıyor",
  quote_sent: "Teklif Gönderildi",
  negotiation: "Müzakere Aşaması",
  approved: "Onaylandı",
  converted_to_order: "Siparişe Dönüştü"
};

export const proposalStatusColors: Record<ProposalStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending_approval: "bg-amber-100 text-amber-800",
  sent: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-slate-100 text-slate-800",
  discovery_scheduled: "bg-blue-100 text-blue-800",
  meeting_completed: "bg-indigo-100 text-indigo-800",
  quote_in_progress: "bg-violet-100 text-violet-800",
  quote_sent: "bg-yellow-100 text-yellow-800",
  negotiation: "bg-purple-100 text-purple-800",
  approved: "bg-green-100 text-green-800",
  converted_to_order: "bg-indigo-100 text-indigo-800"
};

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
  title: string;
  customer_id: string | null;
  opportunity_id: string | null;
  employee_id: string | null;
  status: ProposalStatus;
  total_value: number;
  created_at: string;
  updated_at: string;
  proposal_number?: number;
  payment_terms?: string;
  delivery_terms?: string;
  items?: ProposalItem[];
  notes?: string;
  
  // Additional properties needed based on errors
  valid_until?: string | null;
  currency?: string;
  internal_notes?: string;
  discounts?: number;
  additional_charges?: number;
  
  // Joined relations
  customer?: Customer;
  employee?: Employee;
}

export interface ProposalItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total_price: number;
}

export interface ProposalFilters {
  status: string;
  search: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}
