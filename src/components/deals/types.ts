
import { Deal } from "@/types/deal";

export interface Column {
  id: keyof Deal | 'actions';
  label: string;
  visible: boolean;
}

export interface FilterState {
  status: Deal['status'] | 'all';
  customer: string;
  employee: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  valueRange: {
    min: string;
    max: string;
  };
}

export interface DealsTableProps {
  deals: Deal[];
  onViewDeal: (deal: Deal) => void;
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (deal: Deal) => void;
  onUpdateDealStatus: (deal: Deal, newStatus: Deal['status']) => void;
}
