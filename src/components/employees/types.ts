
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  hire_date: string;
  status: 'active' | 'inactive';
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

export type ViewMode = 'table' | 'grid';
