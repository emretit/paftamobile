
export interface ProposalFilters {
  search?: string;
  status?: string;
  employeeId?: string | null;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
}

export interface ProposalFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusChange: (status: string) => void;
  onDateRangeChange?: (range: any) => void;
  selectedStatus: string;
  onFilterChange?: (filters: ProposalFilters) => void;
}

export interface Column {
  id: string;
  label: string;
  visible: boolean;
  sortable?: boolean;
}
