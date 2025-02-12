
export interface Customer {
  id: string;
  name: string;
  email: string | null;
  mobile_phone: string | null;
  office_phone: string | null;
  company: string | null;
  type: "bireysel" | "kurumsal";
  status: "aktif" | "pasif" | "potansiyel";
  representative: string | null;
  balance: number;
  address: string | null;
}

export interface CustomerFormData {
  name: string;
  email: string;
  mobile_phone: string;
  office_phone: string;
  company: string;
  type: "bireysel" | "kurumsal";
  status: "aktif" | "pasif" | "potansiyel";
  representative: string;
  balance: number;
  address: string;
}
