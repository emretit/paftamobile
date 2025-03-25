
export type OpportunityStatus = 
  'new' | 
  'first_contact' | 
  'site_visit' | 
  'preparing_proposal' | 
  'proposal_sent' | 
  'accepted' | 
  'lost';

export type OpportunityPriority = 'low' | 'medium' | 'high';

export interface ContactHistoryItem {
  id?: string;
  contact_type: 'call' | 'email' | 'meeting' | 'other';
  date: string;
  notes: string;
  employee_name?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  status: OpportunityStatus;
  priority?: OpportunityPriority;
  value?: number;
  currency?: string;
  customer_id?: string;
  customer_name?: string;
  customer?: {
    id: string;
    name: string;
    company?: string;
  };
  assigned_to?: string;
  assigned_name?: string;
  created_at: string;
  updated_at: string;
  expected_close_date?: string;
  proposal_id?: string;
  proposal_title?: string;
  source?: string;
  notes?: string;
  tags?: string[];
  contact_history?: ContactHistoryItem[];
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  // Deprecated fields - will use customer and employee instead
  employee_id?: string;
}

export interface OpportunitiesGroupedByStatus {
  new: Opportunity[];
  first_contact: Opportunity[];
  site_visit: Opportunity[];
  preparing_proposal: Opportunity[];
  proposal_sent: Opportunity[];
  accepted: Opportunity[];
  lost: Opportunity[];
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
  new: 'bg-blue-100 text-blue-800',
  first_contact: 'bg-purple-100 text-purple-800',
  site_visit: 'bg-yellow-100 text-yellow-800',
  preparing_proposal: 'bg-orange-100 text-orange-800',
  proposal_sent: 'bg-indigo-100 text-indigo-800',
  accepted: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800'
};
