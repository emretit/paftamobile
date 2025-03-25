
export type OpportunityStatus = 
  'new' | 
  'first_contact' | 
  'site_visit' | 
  'preparing_proposal' | 
  'proposal_sent' | 
  'accepted' | 
  'lost';

export type OpportunityPriority = 'low' | 'medium' | 'high';

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
