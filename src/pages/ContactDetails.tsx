
import { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { TopBar } from "@/components/TopBar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContactHeader } from "@/components/customers/details/ContactHeader";
import { ContactTabs } from "@/components/customers/details/ContactTabs";
import { EditableCustomerDetails } from "@/components/customers/details/EditableCustomerDetails";
import { EditableContactInfo } from "@/components/customers/details/EditableContactInfo";

interface ContactDetailsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ContactDetails = ({ isCollapsed, setIsCollapsed }: ContactDetailsProps) => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);

  const { data: customer, isLoading, refetch } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) return null;
      
      // Using proper Supabase filter with the UUID
      const { data, error } = await supabase
        .from('customers')
        .select()
        .match({ id })
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching customer:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!id,
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSuccess = async () => {
    setIsEditing(false);
    await refetch();
  };

  const handleContactUpdate = (updatedCustomer: any) => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
          <TopBar />
          <div className="p-8">
            <div className="text-center py-8">Yükleniyor...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
          <TopBar />
          <div className="p-8">
            <div className="text-center py-8">Müşteri bulunamadı</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <TopBar />
        <div className="p-8">
          {isEditing ? (
            <EditableCustomerDetails 
              customer={customer} 
              onCancel={handleCancel} 
              onSuccess={handleSuccess}
            />
          ) : (
            <>
              <ContactHeader customer={customer} id={id || ''} onEdit={handleEdit} />
              <div className="mt-6">
                <EditableContactInfo customer={customer} onUpdate={handleContactUpdate} />
              </div>
              <ContactTabs customer={customer} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ContactDetails;
