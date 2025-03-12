
export type EmployeeStatus = 'aktif' | 'pasif';
export type Gender = 'male' | 'female' | 'other';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  position: string;
  department: string;
  hire_date: string;
  status: EmployeeStatus;
  avatar_url: string | null;
  
  // Extended personal information
  date_of_birth?: string | null;
  gender?: Gender | null;
  marital_status?: MaritalStatus | null;
  address?: string | null;
  country?: string | null;
  city?: string | null;
  district?: string | null;
  postal_code?: string | null;
  id_ssn?: string | null;
  
  // Emergency contact
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relation?: string | null;
}

export interface EmployeeSalary {
  id: string;
  employee_id: string;
  gross_salary: number;
  net_salary: number;
  allowances: Record<string, any>;
  effective_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeLeave {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
  reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeePerformance {
  id: string;
  employee_id: string;
  review_date: string;
  review_type: string;
  metrics: Record<string, any>;
  feedback?: string;
  rating?: number;
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  upload_date: string;
}

export type ViewMode = 'table' | 'grid';
