
import { Proposal } from "@/types/proposal";

export interface Column {
  id: keyof Proposal | 'actions';
  label: string;
  visible: boolean;
  sortable?: boolean;
}
