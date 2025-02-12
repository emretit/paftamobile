
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
      setFormData(customer as CustomerFormData);
    }
  }, [customer]);

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      if (id) {
        const { error } = await supabase
          .from('customers')
          .update(data)
          .eq('id', id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([data]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: id ? "Müşteri güncellendi" : "Müşteri eklendi",
        description: id ? "Müşteri bilgileri başarıyla güncellendi." : "Yeni müşteri başarıyla eklendi.",
      });
      navigate('/contacts');
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
      console.error('Error:', error);
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
