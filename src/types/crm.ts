
// Define opportunity status options matching our requirements
export type OpportunityStatus = 
  | "new"               // Yeni
  | "first_contact"     // İlk Görüşme 
  | "site_visit"        // Ziyaret Yapıldı
  | "preparing_proposal" // Teklif Hazırlanıyor
  | "proposal_sent"     // Teklif Gönderildi
  | "accepted"          // Kabul Edildi
  | "lost";             // Kaybedildi

export type OpportunityPriority = "low" | "medium" | "high";

// Map opportunity status to user-friendly labels
export const opportunityStatusLabels: Record<OpportunityStatus, string> = {
  new: "Yeni",
  first_contact: "İlk Görüşme",
  site_visit: "Ziyaret Yapıldı",
  preparing_proposal: "Teklif Hazırlanıyor",
  proposal_sent: "Teklif Gönderildi",
  accepted: "Kabul Edildi",
  lost: "Kaybedildi"
};

// Map opportunity priority to user-friendly labels
export const opportunityPriorityLabels: Record<OpportunityPriority, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek"
};

// Map opportunity status to colors for UI
export const opportunityStatusColors: Record<OpportunityStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  first_contact: "bg-purple-100 text-purple-800",
  site_visit: "bg-yellow-100 text-yellow-800",
  preparing_proposal: "bg-orange-100 text-orange-800",
  proposal_sent: "bg-indigo-100 text-indigo-800",
  accepted: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800"
};

// Proposal status options
export type ProposalStatus = "draft" | "pending_approval" | "sent" | "accepted" | "rejected" | "expired";

export type ProposalStatusType = ProposalStatus; // Alias for backward compatibility

// Employee object structure from database
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  avatar_url?: string;
}

// Customer object structure from database
export interface Customer {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
}

// Extended opportunity fields for UI display
export interface OpportunityExtended extends Opportunity {
  customer_name?: string;
  employee_name?: string;
  currency?: string;
  proposal_id?: string;
  contact_history?: ContactHistoryEntry[];
}

// Opportunity object structure
export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  status: OpportunityStatus;
  priority: OpportunityPriority;
  value: number;
  customer_id?: string;
  employee_id?: string;
  created_at: string;
  updated_at: string;
  expected_close_date?: string;
  last_contact_date?: string;
  notes?: string;
  
  // Joined relations
  customer?: Customer;
  employee?: Employee;
}

// For task types that are related to opportunities
export type CrmTaskType = "opportunity" | "proposal" | "general";

// For contact history entries
export interface ContactHistoryEntry {
  id: string;
  date: string;
  contact_type: "call" | "email" | "meeting" | "other";
  notes: string;
  employee_id?: string;
  employee_name?: string;
}

// Alias for backward compatibility in existing code
export type ContactHistoryItem = ContactHistoryEntry;
