
export type ProposalStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

export interface Proposal {
  id: string;
  title: string;
  customer_id: string | null;
  employee_id: string | null;
  deal_id: string | null;
  status: ProposalStatus;
  total_value: number;
  sent_date: string | null;
  valid_until: string | null;
  customer_segment: string | null;
  created_at: string;
  updated_at: string;
  proposal_number: number;
  customer?: {
    name: string;
  };
  employee?: {
    first_name: string;
    last_name: string;
  };
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
