
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  hire_date: string;
  status: 'aktif' | 'pasif' | 'izinli' | 'ayrıldı';
  email: string;
  phone: string | null;
  avatar_url: string | null;
}
