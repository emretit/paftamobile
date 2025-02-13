
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SupplierListHeader from "@/components/suppliers/SupplierListHeader";
import SupplierListFilters from "@/components/suppliers/SupplierListFilters";
import SupplierList from "@/components/suppliers/SupplierList";
import { Supplier } from "@/types/supplier";

interface SuppliersProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Suppliers = ({ isCollapsed, setIsCollapsed }: SuppliersProps) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
      }
      
      return data as Supplier[];
    }
  });

  const filteredSuppliers = suppliers?.filter(supplier => {
    const matchesSearch = !search || 
      supplier.name.toLowerCase().includes(search.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(search.toLowerCase()) ||
      supplier.company?.toLowerCase().includes(search.toLowerCase());

    const matchesType = !typeFilter || supplier.type === typeFilter;
    const matchesStatus = !statusFilter || supplier.status === statusFilter;

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
        <SupplierListHeader />
        <SupplierListFilters 
          search={search}
          setSearch={setSearch}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
        <SupplierList 
          suppliers={filteredSuppliers}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default Suppliers;
