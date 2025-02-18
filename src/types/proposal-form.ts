
export type PaymentTerm = "prepaid" | "net30" | "net60" | "custom";

export interface ProposalItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalPrice: number;
}

export interface ProposalFormData {
  title: string;
  customer_id: string | null;
  items: ProposalItem[];
  discounts: number;
  additionalCharges: number;
  validUntil: Date | null;
  paymentTerm: PaymentTerm;
  internalNotes: string;
  files: File[];
  status: "draft" | "new" | "review" | "negotiation" | "accepted" | "rejected";
}

export interface ProposalFormProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}
