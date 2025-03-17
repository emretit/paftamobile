
import { Proposal } from "./proposal";
import { Task } from "./task";

export type OpportunityStatus = 
  | 'new'
  | 'first_contact'
  | 'site_visit'
  | 'preparing_proposal'
  | 'proposal_sent'
  | 'accepted'
  | 'lost';

export type OpportunityPriority = 'low' | 'medium' | 'high';

export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  status: OpportunityStatus;
  priority: OpportunityPriority;
  customer_id?: string;
  customer_name?: string;
  employee_id?: string;
  employee_name?: string;
  expected_close_date?: string;
  created_at: string;
  updated_at: string;
  value: number;
  currency?: string;
  contact_history?: ContactHistoryItem[];
  products?: OpportunityProduct[];
  notes?: string;
  proposal_id?: string;
  tasks?: Task[];
  tags?: string[];
}

export interface ContactHistoryItem {
  id: string;
  date: string;
  contact_type: 'call' | 'email' | 'meeting' | 'other';
  notes: string;
  employee_id: string;
  employee_name?: string;
}

export interface OpportunityProduct {
  id: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface ProposalWithRelations extends Proposal {
  opportunity_id?: string;
  opportunity?: Opportunity;
  tasks?: Task[];
}

export const opportunityStatusLabels: Record<OpportunityStatus, string> = {
  new: 'Yeni',
  first_contact: 'İlk Görüşme',
  site_visit: 'Ziyaret Yapıldı',
  preparing_proposal: 'Teklif Hazırlanıyor',
  proposal_sent: 'Teklif Gönderildi',
  accepted: 'Kabul Edildi',
  lost: 'Kaybedildi'
};

export const opportunityPriorityLabels: Record<OpportunityPriority, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek'
};

export const opportunityStatusColors: Record<OpportunityStatus, string> = {
  new: 'bg-blue-500 text-white',
  first_contact: 'bg-purple-500 text-white',
  site_visit: 'bg-indigo-500 text-white',
  preparing_proposal: 'bg-amber-500 text-white',
  proposal_sent: 'bg-yellow-500 text-black',
  accepted: 'bg-green-500 text-white',
  lost: 'bg-red-500 text-white'
};

export const proposalStatusTypes = ['preparing', 'pending', 'sent'] as const;
export type ProposalStatusType = typeof proposalStatusTypes[number];

export const proposalStatusLabels: Record<ProposalStatusType, string> = {
  preparing: 'Hazırlanıyor',
  pending: 'Onay Bekliyor',
  sent: 'Gönderildi'
};

export const proposalStatusColors: Record<ProposalStatusType, string> = {
  preparing: 'bg-amber-500 text-white',
  pending: 'bg-blue-500 text-white',
  sent: 'bg-green-500 text-white'
};
