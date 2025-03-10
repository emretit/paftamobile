
export interface Department {
  id: string;
  name: string;
}

export interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hire_date: string;
  status: 'active' | 'inactive';
  avatar_url?: string;
}

export const initialFormData: EmployeeFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  hire_date: new Date().toISOString().split('T')[0],
  status: "active"
};

export const POSITIONS = ['Admin', 'Technician', 'Sales Rep', 'Support'];

// Add form validation schema
export const formValidationSchema = {
  first_name: { required: true, message: 'First name is required' },
  last_name: { required: true, message: 'Last name is required' },
  email: { required: true, message: 'Email is required' },
  position: { required: true, message: 'Position is required' },
  department: { required: true, message: 'Department is required' },
  hire_date: { required: true, message: 'Hire date is required' },
  status: { required: true, message: 'Status is required' }
};
