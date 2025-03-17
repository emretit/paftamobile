
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
  opportunity_id: string;
  contact_date: string;
  contact_type: "call" | "email" | "meeting" | "other";
  notes: string;
  employee_id: string;
  created_at: string;
  
  // Joined relation
  employee?: Employee;
}
