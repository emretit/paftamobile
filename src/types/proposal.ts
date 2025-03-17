
export interface Proposal {
  id: string;
  title: string;
  customer_id: string | null;
  opportunity_id: string | null;
  employee_id: string | null;
  status: string;
  total_value: number;
  created_at: string;
  updated_at: string;
  proposal_number?: number;
  payment_terms?: string;
  delivery_terms?: string;
  items?: ProposalItem[];
  notes?: string;
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
