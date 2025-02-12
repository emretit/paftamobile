
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

  const { data: customer, isLoading: isLoadingCustomer, error: customerError } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching customer:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Müşteri bulunamadı');
      }

      return data;
    },
    enabled: !!id,
    retry: false,
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
        balance: customer.balance || 0,
        address: customer.address || "",
        tax_number: customer.tax_number || "",
        tax_office: customer.tax_office || "",
      });
    }
  }, [customer]);

  useEffect(() => {
    if (customerError) {
      toast({
        title: "Hata",
        description: "Müşteri bilgileri yüklenemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
      navigate('/contacts');
    }
  }, [customerError, navigate, toast]);

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const sanitizedData = {
        name: data.name,
        email: data.email || null,
        mobile_phone: data.mobile_phone || null,
        office_phone: data.office_phone || null,
        company: data.company || null,
        type: data.type,
        status: data.status,
        representative: data.representative || null,
        balance: data.balance || 0,
        address: data.address || null,
        tax_number: data.type === 'kurumsal' ? data.tax_number || null : null,
        tax_office: data.type === 'kurumsal' ? data.tax_office || null : null,
      };

      if (id) {
        // Güncelleme işlemi
        console.log('Güncellenecek veri:', sanitizedData);
        const { data: updatedData, error } = await supabase
          .from('customers')
          .update(sanitizedData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error('Güncelleme hatası:', error);
          throw error;
        }

        if (!updatedData) {
          console.error('Güncellenmiş veri bulunamadı');
          throw new Error('Müşteri güncellenemedi');
        }

        console.log('Güncellenmiş veri:', updatedData);
        return updatedData;
      } else {
        // Yeni müşteri ekleme
        const { data: newData, error } = await supabase
          .from('customers')
          .insert([sanitizedData])
          .select()
          .single();
        
        if (error) {
          console.error('Ekleme hatası:', error);
          throw error;
        }

        if (!newData) {
          console.error('Yeni eklenen veri bulunamadı');
          throw new Error('Müşteri eklenemedi');
        }

        console.log('Yeni eklenen veri:', newData);
        return newData;
      }
    },
    onSuccess: (data) => {
      console.log('İşlem başarılı, dönen veri:', data);
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
      console.error('Mutation error:', error);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form gönderiliyor:', formData);
    try {
      await mutation.mutateAsync(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (customerError) {
    return null;
  }

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
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Kaydediliyor..." : (id ? "Güncelle" : "Kaydet")}
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
