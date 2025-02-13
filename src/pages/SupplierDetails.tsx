
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContactHeader } from "@/components/suppliers/details/ContactHeader";
import { ContactTabs } from "@/components/suppliers/details/ContactTabs";

interface SupplierDetailsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const SupplierDetails = ({ isCollapsed, setIsCollapsed }: SupplierDetailsProps) => {
  const { id } = useParams();

  const { data: supplier, isLoading } = useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'} p-8`}>
          <div className="text-center py-8">Yükleniyor...</div>
        </main>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'} p-8`}>
          <div className="text-center py-8">Tedarikçi bulunamadı</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'} p-8`}>
        <ContactHeader supplier={supplier} id={id} />
        <ContactTabs supplier={supplier} />
      </main>
    </div>
  );
};

export default SupplierDetails;
