
export type PaymentTerm = "prepaid" | "net15" | "net30" | "net60" | "custom";

export interface ProposalItem {
  [key: string]: string | number | undefined;
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalPrice: number;
  product_id?: string; // Optional product reference
}

export interface ProposalFormData {
  title: string;
  proposalNumber?: number;
  proposalDate: Date;
  expirationDate?: Date;
  validUntil?: Date;
  partnerType: "customer" | "supplier";
  customer_id: string;
  supplier_id: string;
  employee_id: string;
  items: ProposalItem[];
  discounts: number;
  additionalCharges: number;
  paymentTerm: PaymentTerm;
  internalNotes: string;
  files: File[];
  status: "draft" | "new" | "review" | "negotiation" | "accepted" | "rejected";
}

export interface ProposalFormProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}
