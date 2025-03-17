
import { OpportunityStatus, OpportunityPriority } from "./crm";

export interface Deal {
  id: string;
  title: string;
  value: number;
  customerName?: string;
  employeeName?: string;
  priority: OpportunityPriority;
  status: OpportunityStatus;
  proposalDate?: Date;
  lastContactDate?: Date;
  expectedCloseDate?: Date;
  description?: string;
  department?: string;
  contactHistory?: any[];
  proposalFiles?: any[];
  nextSteps?: any[];
  productServices?: any[];
  reminders?: any[];
  notes?: string;
  internalComments?: string;
}
