
export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled' | 'revised';

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
  group?: string; // Grup bilgisi (örn. ürün, hizmet)
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  original_currency?: string; // Ürünün orijinal para birimi
  original_price?: number; // Ürünün orijinal fiyatı
}

export interface ProposalAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  created_at: string;
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
  currency?: string; // Para birimi
  items?: ProposalItem[];
  attachments?: ProposalAttachment[];
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
  currency?: string; // Para birimi
}
