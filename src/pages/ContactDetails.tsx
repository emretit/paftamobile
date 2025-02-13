
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContactHeader } from "@/components/customers/details/ContactHeader";
import { ContactTabs } from "@/components/customers/details/ContactTabs";

interface ContactDetailsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ContactDetails = ({ isCollapsed, setIsCollapsed }: ContactDetailsProps) => {
  const { id } = useParams();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('customers')
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

  if (!customer) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'} p-8`}>
          <div className="text-center py-8">Müşteri bulunamadı</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'} p-8`}>
        <ContactHeader customer={customer} id={id} />
        <ContactTabs customer={customer} />
      </main>
    </div>
  );
};

export default ContactDetails;
