
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import CustomerListHeader from "@/components/customers/CustomerListHeader";
import CustomerListFilters from "@/components/customers/CustomerListFilters";
import CustomerList from "@/components/customers/CustomerList";

interface ContactsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  type: "bireysel" | "kurumsal";
  status: "aktif" | "pasif" | "potansiyel";
  representative: string | null;
  balance: number;
}

const Contacts = ({ isCollapsed, setIsCollapsed }: ContactsProps) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
      
      return data as Customer[];
    }
  });

  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = !search || 
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email?.toLowerCase().includes(search.toLowerCase()) ||
      customer.company?.toLowerCase().includes(search.toLowerCase());

    const matchesType = !typeFilter || customer.type === typeFilter;
    const matchesStatus = !statusFilter || customer.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-white flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 p-4 sm:p-8 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <CustomerListHeader />
        <CustomerListFilters 
          search={search}
          setSearch={setSearch}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
        <CustomerList 
          customers={filteredCustomers}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default Contacts;
