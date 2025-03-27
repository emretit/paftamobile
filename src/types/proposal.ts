
export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled' | 'revised' | 'pending_approval';

// Status label mapping for UI display
export const proposalStatusLabels: Record<ProposalStatus, string> = {
  draft: 'Taslak',
  sent: 'Gönderildi',
  accepted: 'Kabul Edildi',
  rejected: 'Reddedildi',
  expired: 'Süresi Dolmuş',
  cancelled: 'İptal Edildi',
  revised: 'Revize Edildi',
  pending_approval: 'Onay Bekliyor'
};

// Status color mapping for UI display
export const proposalStatusColors: Record<ProposalStatus, string> = {
  draft: 'bg-gray-500 hover:bg-gray-600',
  sent: 'bg-blue-500 hover:bg-blue-600',
  accepted: 'bg-green-500 hover:bg-green-600',
  rejected: 'bg-red-500 hover:bg-red-600',
  expired: 'bg-orange-500 hover:bg-orange-600',
  cancelled: 'bg-rose-500 hover:bg-rose-600',
  revised: 'bg-amber-500 hover:bg-amber-600',
  pending_approval: 'bg-purple-500 hover:bg-purple-600'
};

export interface ProposalItem {
  id: string;
  product_id?: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  discount_rate?: number;
  total_price: number;
  currency?: string;
  group?: string; // Group information (e.g., product, service)
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  original_currency?: string; // Original currency of the product
  original_price?: number; // Original price of the product
}

export interface ProposalAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  created_at: string;
}

// Customer and Employee interfaces to support relations
export interface Customer {
  id: string;
  name: string;
  email?: string;
  company?: string;
  phone?: string;
  mobile_phone?: string;
  office_phone?: string;
  address?: string;
  tax_number?: string;
  tax_office?: string;
}

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  avatar_url?: string;
}

export interface Proposal {
  id: string;
  number: string;
  title: string;
  description?: string;
  customer_id?: string;
  customer_name?: string;
  customer_email?: string;
  employee_id?: string;
  employee_name?: string;
  opportunity_id?: string;
  opportunity_title?: string;
  valid_until?: string;
  payment_terms?: string;
  delivery_terms?: string;
  notes?: string;
  terms?: string;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
  total_amount: number;
  currency?: string; // Currency
  items?: ProposalItem[];
  attachments?: ProposalAttachment[];
  
  // Additional fields used in various components
  proposal_number?: string; // Backward compatibility field
  total_value?: number; // Backward compatibility field for total_amount
  internal_notes?: string;
  discounts?: number;
  additional_charges?: number;
  
  // Relations
  customer?: Customer;
  employee?: Employee;
}

export interface ProposalFormValues {
  title: string;
  description?: string;
  customerId?: string;
  employeeId?: string;
  opportunityId?: string;
  validUntil?: Date;
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  status: ProposalStatus;
  items?: ProposalItem[];
  currency?: string; // Currency
}
