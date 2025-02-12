
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CustomerFormHeader from "@/components/customers/CustomerFormHeader";
import CustomerFormFields from "@/components/customers/CustomerFormFields";
import { CustomerFormData } from "@/types/customer";

interface CustomerFormProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const CustomerForm = ({ isCollapsed, setIsCollapsed }: CustomerFormProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    email: "",
    mobile_phone: "",
    office_phone: "",
    company: "",
    type: "bireysel",
    status: "potansiyel",
    representative: "",
    balance: 0,
    address: "",
    tax_number: "",
    tax_office: "",
  });

  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
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

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        mobile_phone: customer.mobile_phone || "",
        office_phone: customer.office_phone || "",
        company: customer.company || "",
        type: customer.type,
        status: customer.status,
        representative: customer.representative || "",
        balance: customer.balance,
        address: customer.address || "",
        tax_number: customer.tax_number || "",
        tax_office: customer.tax_office || "",
      });
    }
  }, [customer]);

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const sanitizedData = {
        ...data,
        email: data.email || null,
        mobile_phone: data.mobile_phone || null,
        office_phone: data.office_phone || null,
        company: data.company || null,
        representative: data.representative || null,
        address: data.address || null,
        tax_number: data.type === 'kurumsal' ? data.tax_number || null : null,
        tax_office: data.type === 'kurumsal' ? data.tax_office || null : null,
      };

      if (id) {
        const { error } = await supabase
          .from('customers')
          .update(sanitizedData)
          .eq('id', id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([sanitizedData]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['customer', id] });
      }
      toast({
        title: id ? "Müşteri güncellendi" : "Müşteri eklendi",
        description: id ? "Müşteri bilgileri başarıyla güncellendi." : "Yeni müşteri başarıyla eklendi.",
      });
      navigate('/contacts');
    },
    onError: (error) => {
      console.error('Error:', error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-white flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 p-4 sm:p-8 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <CustomerFormHeader id={id} />

        {isLoadingCustomer && id ? (
          <div className="text-center py-8">Yükleniyor...</div>
        ) : (
          <Card className="max-w-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <CustomerFormFields formData={formData} setFormData={setFormData} />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/contacts')}
                >
                  İptal
                </Button>
                <Button type="submit">
                  {id ? "Güncelle" : "Kaydet"}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </main>
    </div>
  );
};

export default CustomerForm;
