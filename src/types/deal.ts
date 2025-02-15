
export interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  status: "new" | "negotiation" | "follow_up" | "won" | "lost";
  priority: "low" | "medium" | "high";
  customerName: string;
  employeeName: string;
  expectedCloseDate?: Date;
  proposalDate: Date;
  lastContactDate: Date;
  notes?: string;
  internalComments?: string;
  department?: string;
  contactHistory?: any[];
  proposalFiles?: any[];
  nextSteps?: any[];
  productServices?: any[];
  validityPeriod?: any;
  reminders?: any[];
}
