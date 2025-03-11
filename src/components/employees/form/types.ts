
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
  
  // Extended personal information
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  address?: string;
  country?: string;
  city?: string;
  district?: string;
  postal_code?: string;
  id_ssn?: string;
  
  // Emergency contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
}

export const initialFormData: EmployeeFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  hire_date: new Date().toISOString().split('T')[0],
  status: "active",
  
  // Initialize extended fields
  date_of_birth: "",
  gender: "",
  marital_status: "",
  address: "",
  country: "",
  city: "",
  district: "",
  postal_code: "",
  id_ssn: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relation: ""
};

export const POSITIONS = ['Admin', 'Technician', 'Sales Rep', 'Support'];
export const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
export const MARITAL_STATUS = ['Single', 'Married', 'Divorced', 'Widowed'];

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
